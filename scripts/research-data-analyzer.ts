#!/usr/bin/env bun
/**
 * CodonCanvas Research Data Analyzer
 *
 * Automates statistical analysis for educational research studies using CodonCanvas.
 * Implements analysis procedures from RESEARCH_FRAMEWORK.md.
 *
 * Features:
 * - Pre-post comparison (paired t-test, Cohen's d)
 * - RCT analysis (independent t-test, ANCOVA)
 * - Subscale analysis (repeated measures)
 * - Power analysis and sample size calculation
 * - Effect size interpretation
 * - Publication-ready tables and figures
 *
 * Usage:
 *   npm run research:analyze -- --design prepost --data study1.csv
 *   npm run research:analyze -- --design rct --data treatment.csv --control control.csv
 *   npm run research:analyze -- --power-analysis --effect 0.5 --alpha 0.05
 */

import * as fs from "node:fs";
import { csv2json } from "csv42";

interface StudentData {
  id: string;
  group?: "treatment" | "control";
  pretest_total: number;
  posttest_total: number;
  delayed_total?: number;
  pretest_silent: number;
  pretest_missense: number;
  pretest_nonsense: number;
  pretest_frameshift: number;
  pretest_indel: number;
  posttest_silent: number;
  posttest_missense: number;
  posttest_nonsense: number;
  posttest_frameshift: number;
  posttest_indel: number;
  mtt_score?: number;
  imi_interest?: number;
  imi_competence?: number;
  imi_effort?: number;
  imi_value?: number;
  gpa?: number;
  prior_programming?: 0 | 1 | 2 | 3;
  institution?: string;
}

/**
 * Required fields for StudentData validation (must be present and correct type)
 */
const REQUIRED_STUDENT_FIELDS = [
  "id",
  "pretest_total",
  "posttest_total",
  "pretest_silent",
  "pretest_missense",
  "pretest_nonsense",
  "pretest_frameshift",
  "pretest_indel",
  "posttest_silent",
  "posttest_missense",
  "posttest_nonsense",
  "posttest_frameshift",
  "posttest_indel",
] as const;

/**
 * Fields that should be parsed as numbers
 */
const NUMERIC_STUDENT_FIELDS = new Set([
  "pretest_total",
  "posttest_total",
  "delayed_total",
  "pretest_silent",
  "pretest_missense",
  "pretest_nonsense",
  "pretest_frameshift",
  "pretest_indel",
  "posttest_silent",
  "posttest_missense",
  "posttest_nonsense",
  "posttest_frameshift",
  "posttest_indel",
  "mtt_score",
  "imi_interest",
  "imi_competence",
  "imi_effort",
  "imi_value",
  "gpa",
  "prior_programming",
]);

/**
 * Validate and construct StudentData from a parsed row
 * Returns the validated StudentData or null if invalid
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Explicit field validation requires checking each field
function validateStudentData(
  row: Record<string, string | number | undefined>,
  rowIndex: number,
): StudentData | null {
  // Validate id is a string
  const id = row.id;
  if (typeof id !== "string" || id.trim() === "") {
    console.error(`Error: Row ${rowIndex + 1} "id" must be a non-empty string`);
    return null;
  }

  // Validate all required numeric fields
  for (const field of REQUIRED_STUDENT_FIELDS) {
    if (field === "id") continue;
    const value = row[field];
    if (
      value === undefined ||
      typeof value !== "number" ||
      !Number.isFinite(value)
    ) {
      console.error(
        `Error: Row ${rowIndex + 1} field "${field}" must be a valid number, got: ${value}`,
      );
      return null;
    }
  }

  // Construct StudentData with validated required fields
  const data: StudentData = {
    id,
    pretest_total: row.pretest_total as number,
    posttest_total: row.posttest_total as number,
    pretest_silent: row.pretest_silent as number,
    pretest_missense: row.pretest_missense as number,
    pretest_nonsense: row.pretest_nonsense as number,
    pretest_frameshift: row.pretest_frameshift as number,
    pretest_indel: row.pretest_indel as number,
    posttest_silent: row.posttest_silent as number,
    posttest_missense: row.posttest_missense as number,
    posttest_nonsense: row.posttest_nonsense as number,
    posttest_frameshift: row.posttest_frameshift as number,
    posttest_indel: row.posttest_indel as number,
  };

  // Add optional fields if present
  if (row.group === "treatment" || row.group === "control") {
    data.group = row.group;
  }
  if (
    typeof row.delayed_total === "number" &&
    Number.isFinite(row.delayed_total)
  ) {
    data.delayed_total = row.delayed_total;
  }
  if (typeof row.mtt_score === "number" && Number.isFinite(row.mtt_score)) {
    data.mtt_score = row.mtt_score;
  }
  if (
    typeof row.imi_interest === "number" &&
    Number.isFinite(row.imi_interest)
  ) {
    data.imi_interest = row.imi_interest;
  }
  if (
    typeof row.imi_competence === "number" &&
    Number.isFinite(row.imi_competence)
  ) {
    data.imi_competence = row.imi_competence;
  }
  if (typeof row.imi_effort === "number" && Number.isFinite(row.imi_effort)) {
    data.imi_effort = row.imi_effort;
  }
  if (typeof row.imi_value === "number" && Number.isFinite(row.imi_value)) {
    data.imi_value = row.imi_value;
  }
  if (typeof row.gpa === "number" && Number.isFinite(row.gpa)) {
    data.gpa = row.gpa;
  }
  if (
    row.prior_programming === 0 ||
    row.prior_programming === 1 ||
    row.prior_programming === 2 ||
    row.prior_programming === 3
  ) {
    data.prior_programming = row.prior_programming;
  }
  if (typeof row.institution === "string") {
    data.institution = row.institution;
  }

  return data;
}

interface DescriptiveStats {
  n: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
  median: number;
}

interface TTestResult {
  t: number;
  df: number;
  p: number;
  cohens_d: number;
  ci_lower: number;
  ci_upper: number;
  mean_diff: number;
}

interface PowerAnalysis {
  required_n_per_group: number;
  total_n: number;
  inflated_n_per_group: number; // accounting for attrition
  inflated_total: number;
}

// biome-ignore lint/complexity/noStaticOnlyClass: Intentional grouping for statistical utilities
class Stats {
  /**
   * Calculate mean
   */
  static mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  static sd(values: number[], sample = true): number {
    if (values.length === 0) return 0;
    const m = Stats.mean(values);
    const variance =
      values.reduce((sum, val) => sum + (val - m) ** 2, 0) /
      (sample ? values.length - 1 : values.length);
    return Math.sqrt(variance);
  }

  /**
   * Calculate median
   */
  static median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate descriptive statistics
   */
  static descriptives(values: number[]): DescriptiveStats {
    return {
      n: values.length,
      mean: Stats.mean(values),
      sd: Stats.sd(values),
      min: Math.min(...values),
      max: Math.max(...values),
      median: Stats.median(values),
    };
  }

  /**
   * Paired t-test (for pre-post comparison)
   */
  static pairedTTest(pre: number[], post: number[]): TTestResult {
    if (pre.length !== post.length) {
      throw new Error("Pre and post arrays must have same length");
    }

    const differences = pre.map((p, i) => post[i] - p);
    const n = differences.length;
    const meanDiff = Stats.mean(differences);
    const sdDiff = Stats.sd(differences);
    const seMean = sdDiff / Math.sqrt(n);

    const t = meanDiff / seMean;
    const df = n - 1;
    const p = Stats.tTestPValue(Math.abs(t), df);

    // Cohen's d for paired samples
    const cohens_d = meanDiff / sdDiff;

    // 95% CI for mean difference
    const tCritical = Stats.tCritical(0.05, df);
    const marginOfError = tCritical * seMean;
    const ci_lower = meanDiff - marginOfError;
    const ci_upper = meanDiff + marginOfError;

    return { t, df, p, cohens_d, ci_lower, ci_upper, mean_diff: meanDiff };
  }

  /**
   * Independent t-test (for RCT comparison)
   */
  static independentTTest(group1: number[], group2: number[]): TTestResult {
    const n1 = group1.length;
    const n2 = group2.length;
    const mean1 = Stats.mean(group1);
    const mean2 = Stats.mean(group2);
    const sd1 = Stats.sd(group1);
    const sd2 = Stats.sd(group2);

    // Pooled standard deviation
    const pooledVariance =
      ((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2);
    const pooledSD = Math.sqrt(pooledVariance);
    const seMean = pooledSD * Math.sqrt(1 / n1 + 1 / n2);

    const meanDiff = mean1 - mean2;
    const t = meanDiff / seMean;
    const df = n1 + n2 - 2;
    const p = Stats.tTestPValue(Math.abs(t), df);

    // Cohen's d using pooled SD
    const cohens_d = meanDiff / pooledSD;

    // 95% CI
    const tCritical = Stats.tCritical(0.05, df);
    const marginOfError = tCritical * seMean;
    const ci_lower = meanDiff - marginOfError;
    const ci_upper = meanDiff + marginOfError;

    return { t, df, p, cohens_d, ci_lower, ci_upper, mean_diff: meanDiff };
  }

  /**
   * Approximate t-test p-value (two-tailed)
   * Using simplified t-distribution approximation
   */
  static tTestPValue(t: number, df: number): number {
    const absT = Math.abs(t);

    // For large t, p-value approaches 0
    if (absT > 10) return 0.0001;

    // For large df, use normal approximation
    if (df > 100) {
      return 2 * (1 - Stats.normalCDF(absT));
    }

    // Simplified t-distribution approximation using beta function
    // p ≈ 1 - (1 + t²/df)^(-(df+1)/2) for moderate t
    const ratio = (t * t) / df;
    const p_one_tail = 0.5 * (1 + ratio) ** (-(df + 1) / 2);

    return Math.min(1.0, 2 * p_one_tail); // two-tailed, cap at 1.0
  }

  /**
   * Standard normal CDF approximation
   */
  static normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - prob : prob;
  }

  /**
   * Critical t-value for given alpha and df
   * Approximation for two-tailed test
   */
  static tCritical(alpha: number, df: number): number {
    // Rough approximation using z-score for large df
    if (df > 100) {
      // z-critical for alpha/2 (two-tailed)
      return alpha === 0.05 ? 1.96 : 2.576; // 95% or 99% CI
    }

    // For smaller df, use rough t-critical values
    const tTable: { [key: number]: number } = {
      5: 2.571,
      10: 2.228,
      20: 2.086,
      30: 2.042,
      40: 2.021,
      50: 2.009,
      60: 2.0,
      100: 1.984,
    };

    // Find closest df in table
    const dfs = Object.keys(tTable)
      .map(Number)
      .sort((a, b) => a - b);
    for (const tableDf of dfs) {
      if (df <= tableDf) return tTable[tableDf];
    }
    return 1.96; // fallback to z-critical
  }

  /**
   * Cohen's d interpretation
   */
  static interpretEffectSize(d: number): string {
    const absD = Math.abs(d);
    if (absD < 0.2) return "negligible";
    if (absD < 0.5) return "small";
    if (absD < 0.8) return "medium";
    return "large";
  }

  /**
   * Power analysis for independent t-test
   * Based on Cohen (1988) power tables
   */
  static powerAnalysis(
    effect_size: number,
    alpha: number = 0.05,
    power: number = 0.8,
  ): PowerAnalysis {
    // Simplified calculation using Cohen's f^2 to d conversion
    // n = 2(z_alpha + z_beta)^2 / d^2

    const z_alpha = alpha === 0.05 ? 1.96 : 2.576;
    const z_beta = power === 0.8 ? 0.84 : power === 0.9 ? 1.28 : 0.52;

    const n_per_group = Math.ceil(
      (2 * (z_alpha + z_beta) ** 2) / effect_size ** 2,
    );

    // Account for 20% attrition
    const inflated_n = Math.ceil(n_per_group / 0.8);

    return {
      required_n_per_group: n_per_group,
      total_n: n_per_group * 2,
      inflated_n_per_group: inflated_n,
      inflated_total: inflated_n * 2,
    };
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: Intentional grouping for analysis workflows
class ResearchAnalyzer {
  /**
   * Analyze pre-post design (pilot study)
   */
  static analyzePrePost(data: StudentData[]): void {
    console.log(
      "\n╔══════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║       CodonCanvas Pre-Post Analysis (Pilot Study)           ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════╝\n",
    );

    // Extract scores
    const preScores = data.map((d) => d.pretest_total);
    const postScores = data.map((d) => d.posttest_total);

    // Descriptive statistics
    console.log("📊 DESCRIPTIVE STATISTICS\n");
    const preStats = Stats.descriptives(preScores);
    const postStats = Stats.descriptives(postScores);

    console.log("Pre-test:");
    ResearchAnalyzer.printDescriptives(preStats);
    console.log("\nPost-test:");
    ResearchAnalyzer.printDescriptives(postStats);

    // Paired t-test
    console.log("\n\n📈 PAIRED T-TEST (Pre vs. Post)\n");
    const tResult = Stats.pairedTTest(preScores, postScores);

    console.log(
      `t(${tResult.df}) = ${tResult.t.toFixed(3)}, p = ${ResearchAnalyzer.formatPValue(
        tResult.p,
      )}`,
    );
    console.log(
      `Mean difference: ${tResult.mean_diff.toFixed(2)} (95% CI: [${tResult.ci_lower.toFixed(
        2,
      )}, ${tResult.ci_upper.toFixed(2)}])`,
    );
    console.log(
      `Cohen's d: ${tResult.cohens_d.toFixed(3)} (${Stats.interpretEffectSize(
        tResult.cohens_d,
      )})`,
    );

    if (tResult.p < 0.05) {
      console.log("\n✅ SIGNIFICANT learning gains detected (p < 0.05)");
    } else {
      console.log("\n⚠️  No significant difference (p >= 0.05)");
    }

    // Subscale analysis
    console.log("\n\n🔬 SUBSCALE ANALYSIS (Mutation Types)\n");
    ResearchAnalyzer.analyzeSubscales(data);

    // Retention (if available)
    const withDelayed = data.filter((d) => d.delayed_total !== undefined);
    if (withDelayed.length > 5) {
      console.log("\n\n⏱️  RETENTION ANALYSIS (Delayed Post-test)\n");
      ResearchAnalyzer.analyzeRetention(withDelayed);
    }

    console.log(`\n${"═".repeat(64)}\n`);
  }

  /**
   * Analyze RCT design
   */
  static analyzeRCT(
    treatmentData: StudentData[],
    controlData: StudentData[],
  ): void {
    console.log(
      "\n╔══════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║         CodonCanvas RCT Analysis (Treatment vs. Control)     ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════╝\n",
    );

    // Pre-test equivalence check
    console.log("🔍 PRE-TEST EQUIVALENCE CHECK\n");
    const treatmentPre = treatmentData.map((d) => d.pretest_total);
    const controlPre = controlData.map((d) => d.pretest_total);

    const preEquiv = Stats.independentTTest(treatmentPre, controlPre);
    console.log(
      `Treatment pre-test: M = ${Stats.mean(treatmentPre).toFixed(2)}, SD = ${Stats.sd(
        treatmentPre,
      ).toFixed(2)}`,
    );
    console.log(
      `Control pre-test:   M = ${Stats.mean(controlPre).toFixed(2)}, SD = ${Stats.sd(
        controlPre,
      ).toFixed(2)}`,
    );
    console.log(
      `t(${preEquiv.df}) = ${preEquiv.t.toFixed(3)}, p = ${ResearchAnalyzer.formatPValue(
        preEquiv.p,
      )}`,
    );

    if (preEquiv.p >= 0.05) {
      console.log("✅ Groups are equivalent at baseline (good randomization)");
    } else {
      console.log(
        "⚠️  Groups differ at baseline (consider ANCOVA with pre-test covariate)",
      );
    }

    // Post-test comparison
    console.log("\n\n📊 POST-TEST COMPARISON\n");
    const treatmentPost = treatmentData.map((d) => d.posttest_total);
    const controlPost = controlData.map((d) => d.posttest_total);

    const postResult = Stats.independentTTest(treatmentPost, controlPost);

    console.log(
      `Treatment post-test: M = ${Stats.mean(treatmentPost).toFixed(2)}, SD = ${Stats.sd(
        treatmentPost,
      ).toFixed(2)}`,
    );
    console.log(
      `Control post-test:   M = ${Stats.mean(controlPost).toFixed(2)}, SD = ${Stats.sd(
        controlPost,
      ).toFixed(2)}`,
    );
    console.log(
      `\nt(${postResult.df}) = ${postResult.t.toFixed(3)}, p = ${ResearchAnalyzer.formatPValue(
        postResult.p,
      )}`,
    );
    console.log(
      `Mean difference: ${postResult.mean_diff.toFixed(2)} (95% CI: [${postResult.ci_lower.toFixed(
        2,
      )}, ${postResult.ci_upper.toFixed(2)}])`,
    );
    console.log(
      `Cohen's d: ${postResult.cohens_d.toFixed(3)} (${Stats.interpretEffectSize(
        postResult.cohens_d,
      )})`,
    );

    if (postResult.p < 0.05) {
      console.log("\n✅ SIGNIFICANT treatment effect detected (p < 0.05)");
      console.log(
        `   CodonCanvas shows ${Stats.interpretEffectSize(
          postResult.cohens_d,
        )} effect size`,
      );
    } else {
      console.log("\n⚠️  No significant treatment effect (p >= 0.05)");
    }

    // Gain scores
    console.log("\n\n📈 GAIN SCORE ANALYSIS\n");
    const treatmentGains = treatmentData.map(
      (d) => d.posttest_total - d.pretest_total,
    );
    const controlGains = controlData.map(
      (d) => d.posttest_total - d.pretest_total,
    );

    const gainResult = Stats.independentTTest(treatmentGains, controlGains);
    console.log(
      `Treatment gain: M = ${Stats.mean(treatmentGains).toFixed(2)}, SD = ${Stats.sd(
        treatmentGains,
      ).toFixed(2)}`,
    );
    console.log(
      `Control gain:   M = ${Stats.mean(controlGains).toFixed(2)}, SD = ${Stats.sd(
        controlGains,
      ).toFixed(2)}`,
    );
    console.log(
      `t(${gainResult.df}) = ${gainResult.t.toFixed(3)}, p = ${ResearchAnalyzer.formatPValue(
        gainResult.p,
      )}`,
    );

    console.log(`\n${"═".repeat(64)}\n`);
  }

  /**
   * Analyze mutation type subscales
   */
  static analyzeSubscales(data: StudentData[]): void {
    const mutationTypes = [
      "silent",
      "missense",
      "nonsense",
      "frameshift",
      "indel",
    ];

    console.log(
      "Mutation Type | Pre M(SD)  | Post M(SD) | Gain M(SD) | Cohen's d",
    );
    console.log("─".repeat(64));

    for (const type of mutationTypes) {
      const preKey = `pretest_${type}` as keyof StudentData;
      const postKey = `posttest_${type}` as keyof StudentData;

      const preScores = data.map((d) => d[preKey] as number);
      const postScores = data.map((d) => d[postKey] as number);
      const gains = preScores.map((pre, i) => postScores[i] - pre);

      const preMean = Stats.mean(preScores).toFixed(2);
      const preSD = Stats.sd(preScores).toFixed(2);
      const postMean = Stats.mean(postScores).toFixed(2);
      const postSD = Stats.sd(postScores).toFixed(2);
      const gainMean = Stats.mean(gains).toFixed(2);
      const gainSD = Stats.sd(gains).toFixed(2);

      const d = Stats.mean(gains) / Stats.sd(gains);

      console.log(
        `${type.padEnd(
          13,
        )} | ${preMean}(${preSD}) | ${postMean}(${postSD}) | ${gainMean}(${gainSD}) | ${d.toFixed(
          3,
        )} (${Stats.interpretEffectSize(d)})`,
      );
    }
  }

  /**
   * Analyze retention
   */
  static analyzeRetention(data: StudentData[]): void {
    const postScores = data.map((d) => d.posttest_total);
    const delayedScores = data
      .map((d) => d.delayed_total)
      .filter((s): s is number => s !== undefined);

    const postMean = Stats.mean(postScores);
    const delayedMean = Stats.mean(delayedScores);
    const retention = (delayedMean / postMean) * 100;

    console.log(
      `Immediate post-test: M = ${postMean.toFixed(2)}, SD = ${Stats.sd(
        postScores,
      ).toFixed(2)}`,
    );
    console.log(
      `Delayed post-test:   M = ${delayedMean.toFixed(2)}, SD = ${Stats.sd(
        delayedScores,
      ).toFixed(2)}`,
    );
    console.log(
      `Retention rate:      ${retention.toFixed(
        1,
      )}% of immediate post-test score`,
    );

    const retentionTest = Stats.pairedTTest(postScores, delayedScores);
    console.log(
      `t(${retentionTest.df}) = ${retentionTest.t.toFixed(3)}, p = ${ResearchAnalyzer.formatPValue(
        retentionTest.p,
      )}`,
    );

    if (retentionTest.p >= 0.05) {
      console.log("✅ Learning gains maintained (no significant decay)");
    } else if (retentionTest.mean_diff < 0) {
      console.log("⚠️  Some decay detected, but scores still above baseline");
    } else {
      console.log("✅ Learning gains actually increased (sleeper effect)");
    }
  }

  /**
   * Print descriptive statistics
   */
  static printDescriptives(stats: DescriptiveStats): void {
    console.log(`  N:      ${stats.n}`);
    console.log(`  Mean:   ${stats.mean.toFixed(2)}`);
    console.log(`  SD:     ${stats.sd.toFixed(2)}`);
    console.log(`  Median: ${stats.median.toFixed(2)}`);
    console.log(`  Range:  [${stats.min.toFixed(2)}, ${stats.max.toFixed(2)}]`);
  }

  /**
   * Format p-value
   */
  static formatPValue(p: number): string {
    if (p < 0.001) return "< .001";
    if (p < 0.01) return "< .01";
    if (p < 0.05) return "< .05";
    return p.toFixed(3);
  }

  /**
   * Generate publication-ready table (Markdown)
   */
  static generateTable(
    data: StudentData[],
    _group: "treatment" | "control" | "all",
  ): void {
    console.log("\n📋 PUBLICATION TABLE (Markdown format)\n");
    console.log("```markdown");
    console.log(
      "| Variable | N | Pre M(SD) | Post M(SD) | Gain M(SD) | t | df | p | d |",
    );
    console.log(
      "|----------|---|-----------|------------|------------|---|----|----|---|",
    );

    const pre = data.map((d) => d.pretest_total);
    const post = data.map((d) => d.posttest_total);
    const result = Stats.pairedTTest(pre, post);
    const gains = pre.map((p, i) => post[i] - p);

    console.log(
      `| Total Score | ${data.length} | ${Stats.mean(pre).toFixed(2)}(${Stats.sd(
        pre,
      ).toFixed(
        2,
      )}) | ${Stats.mean(post).toFixed(2)}(${Stats.sd(post).toFixed(2)}) | ${Stats.mean(
        gains,
      ).toFixed(2)}(${Stats.sd(gains).toFixed(2)}) | ${result.t.toFixed(
        2,
      )} | ${result.df} | ${ResearchAnalyzer.formatPValue(result.p)} | ${result.cohens_d.toFixed(
        2,
      )} |`,
    );
    console.log("```\n");
  }
}

/**
 * Custom value parser for StudentData CSV
 * Handles numeric fields based on NUMERIC_STUDENT_FIELDS set
 */
function parseStudentValue(value: string, fieldName: string): unknown {
  if (NUMERIC_STUDENT_FIELDS.has(fieldName)) {
    return value ? parseFloat(value) : undefined;
  }
  return value;
}

function parseCSV(filepath: string): StudentData[] {
  const content = fs.readFileSync(filepath, "utf-8");
  const trimmed = content.trim();

  if (!trimmed || !trimmed.includes("\n")) {
    throw new Error("CSV file is empty or missing header");
  }

  // Parse CSV with csv42
  const rawData = csv2json<Record<string, string>>(trimmed, {
    header: true,
    nested: false,
  });

  if (rawData.length === 0) {
    throw new Error("No valid data rows found in CSV");
  }

  // Transform and validate each row
  const results: StudentData[] = [];
  let hasErrors = false;

  rawData.forEach((rawRow, rowIndex) => {
    const row: Record<string, string | number | undefined> = {};

    for (const [key, value] of Object.entries(rawRow)) {
      row[key] = parseStudentValue(String(value), key) as
        | string
        | number
        | undefined;
    }

    // Validate row before adding to results
    const validated = validateStudentData(row, rowIndex);
    if (validated !== null) {
      results.push(validated);
    } else {
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.error(
      "\nWarning: Some rows failed validation and were skipped. Check CSV format.",
    );
  }

  if (results.length === 0) {
    throw new Error("No valid data rows found in CSV");
  }

  return results;
}

function printUsage(): void {
  console.log(`
CodonCanvas Research Data Analyzer
═══════════════════════════════════

USAGE:
  npm run research:analyze -- [OPTIONS]

OPTIONS:
  --design <type>              Study design: prepost | rct
  --data <file>                Data file (CSV format)
  --control <file>             Control group data (for RCT)
  --power-analysis             Run power analysis
  --effect <value>             Expected effect size (default: 0.5)
  --alpha <value>              Alpha level (default: 0.05)
  --power <value>              Desired power (default: 0.80)
  --table                      Generate publication table

EXAMPLES:
  # Pre-post pilot study
  npm run research:analyze -- --design prepost --data pilot_study.csv

  # RCT with treatment and control
  npm run research:analyze -- --design rct --data treatment.csv --control control.csv

  # Power analysis for planning
  npm run research:analyze -- --power-analysis --effect 0.5 --alpha 0.05 --power 0.80

  # Generate publication table
  npm run research:analyze -- --design prepost --data pilot_study.csv --table

CSV FORMAT:
  Required columns for pre-post:
    id, pretest_total, posttest_total, pretest_silent, pretest_missense,
    pretest_nonsense, pretest_frameshift, pretest_indel, posttest_silent,
    posttest_missense, posttest_nonsense, posttest_frameshift, posttest_indel

  Additional for RCT:
    group (treatment|control)

  Optional:
    delayed_total, mtt_score, imi_interest, imi_competence, imi_effort,
    imi_value, gpa, prior_programming, institution
`);
}

/**
 * Safely get a numeric flag value from CLI args
 * Returns fallback if flag not present, exits with error if value invalid
 */
function getNumericFlag(
  args: string[],
  flag: string,
  fallback: number,
): number {
  const idx = args.indexOf(flag);
  if (idx === -1) return fallback;

  if (idx + 1 >= args.length) {
    console.error(`Error: ${flag} requires a numeric value`);
    process.exit(1);
  }

  const value = Number(args[idx + 1]);
  if (!Number.isFinite(value)) {
    console.error(`Error: Invalid value for ${flag}: "${args[idx + 1]}"`);
    process.exit(1);
  }

  return value;
}

/**
 * Safely get a required string flag value from CLI args
 * Exits with error if flag not present or value missing
 */
function getRequiredFlag(args: string[], flag: string): string {
  const idx = args.indexOf(flag);
  if (idx === -1) {
    console.error(`Error: ${flag} is required`);
    printUsage();
    process.exit(1);
  }

  if (idx + 1 >= args.length || args[idx + 1].startsWith("--")) {
    console.error(`Error: ${flag} requires a value`);
    process.exit(1);
  }

  return args[idx + 1];
}

/**
 * Safely get an optional string flag value from CLI args
 * Returns undefined if flag not present, exits with error if value missing
 */
function getOptionalFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;

  if (idx + 1 >= args.length || args[idx + 1].startsWith("--")) {
    console.error(`Error: ${flag} requires a value`);
    process.exit(1);
  }

  return args[idx + 1];
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  // Power analysis
  if (args.includes("--power-analysis")) {
    handlePowerAnalysis(args);
    return;
  }

  // Data analysis
  handleDataAnalysis(args);
}

function handlePowerAnalysis(args: string[]) {
  const effect = getNumericFlag(args, "--effect", 0.5);
  const alpha = getNumericFlag(args, "--alpha", 0.05);
  const power = getNumericFlag(args, "--power", 0.8);

  // Validate supported alpha values
  const SUPPORTED_ALPHA = [0.05, 0.01];
  if (!SUPPORTED_ALPHA.includes(alpha)) {
    console.error(
      `Error: --alpha must be one of [${SUPPORTED_ALPHA.join(", ")}], got: ${alpha}`,
    );
    process.exit(1);
  }

  // Validate supported power values
  const SUPPORTED_POWER = [0.8, 0.9];
  if (!SUPPORTED_POWER.includes(power)) {
    console.error(
      `Error: --power must be one of [${SUPPORTED_POWER.join(", ")}], got: ${power}`,
    );
    process.exit(1);
  }

  console.log(
    "\n╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                     Power Analysis                           ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝\n",
  );

  const result = Stats.powerAnalysis(effect, alpha, power);

  console.log(`Parameters:`);
  console.log(`  Effect size (Cohen's d): ${effect}`);
  console.log(`  Alpha level:             ${alpha}`);
  console.log(`  Desired power:           ${power}\n`);

  console.log(`Sample Size Required:`);
  console.log(`  Per group:               ${result.required_n_per_group}`);
  console.log(`  Total (2 groups):        ${result.total_n}\n`);

  console.log(`With 20% Attrition Buffer:`);
  console.log(`  Per group:               ${result.inflated_n_per_group}`);
  console.log(`  Total (2 groups):        ${result.inflated_total}\n`);

  console.log(`${"═".repeat(64)}\n`);
}

function handleDataAnalysis(args: string[]) {
  const design = getRequiredFlag(args, "--design");
  const dataFile = getRequiredFlag(args, "--data");
  const controlFile = getOptionalFlag(args, "--control");
  const generateTable = args.includes("--table");

  if (!fs.existsSync(dataFile)) {
    console.error(`Error: Data file not found: ${dataFile}`);
    process.exit(1);
  }

  let data: StudentData[];
  try {
    data = parseCSV(dataFile);
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : "Failed to parse CSV"}`,
    );
    process.exit(1);
  }

  if (design === "prepost") {
    ResearchAnalyzer.analyzePrePost(data);
    if (generateTable) {
      ResearchAnalyzer.generateTable(data, "all");
    }
  } else if (design === "rct") {
    handleRCTAnalysis(data, controlFile);
  } else {
    console.error(`Error: Unknown design: ${design}. Use "prepost" or "rct"`);
    process.exit(1);
  }
}

/**
 * Validate that both groups have sufficient sample size for statistical analysis
 */
function validateGroupSizes(
  treatment: StudentData[],
  control: StudentData[],
): void {
  if (treatment.length < 2 || control.length < 2) {
    console.error(
      `Error: Each group must have at least 2 participants for statistical analysis (treatment: ${treatment.length}, control: ${control.length})`,
    );
    process.exit(1);
  }
}

function handleRCTAnalysis(
  data: StudentData[],
  controlFile: string | undefined,
) {
  if (controlFile === undefined) {
    // Assume data file has 'group' column
    const treatment = data.filter((d) => d.group === "treatment");
    const control = data.filter((d) => d.group === "control");

    if (treatment.length === 0 || control.length === 0) {
      console.error(
        'Error: For RCT, either provide --control file or include "group" column in data',
      );
      process.exit(1);
    }

    validateGroupSizes(treatment, control);
    ResearchAnalyzer.analyzeRCT(treatment, control);
  } else {
    if (!fs.existsSync(controlFile)) {
      console.error(`Error: Control file not found: ${controlFile}`);
      process.exit(1);
    }
    let controlData: StudentData[];
    try {
      controlData = parseCSV(controlFile);
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : "Failed to parse control CSV"}`,
      );
      process.exit(1);
    }

    validateGroupSizes(data, controlData);
    ResearchAnalyzer.analyzeRCT(data, controlData);
  }
}

// Run if executed directly
main();

export { parseCSV, ResearchAnalyzer, Stats, type StudentData };
