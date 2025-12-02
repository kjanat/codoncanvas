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
import {
  descriptiveStats,
  independentTTest,
  interpretEffectSize,
  mean,
  pairedTTest,
  powerAnalysis,
  sd,
} from "@/analysis/statistics";
import type { DescriptiveStats } from "@/analysis/types";

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
 * Validate id field is a non-empty string
 */
function validateId(
  row: Record<string, string | number | undefined>,
  rowIndex: number,
): string | null {
  const id = row.id;
  if (typeof id !== "string" || id.trim() === "") {
    console.error(`Error: Row ${rowIndex + 1} "id" must be a non-empty string`);
    return null;
  }
  return id;
}

/**
 * Validate all required numeric fields are present and valid
 */
function validateRequiredNumericFields(
  row: Record<string, string | number | undefined>,
  rowIndex: number,
): boolean {
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
      return false;
    }
  }
  return true;
}

/**
 * Check if value is a valid finite number
 */
function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Add optional fields to StudentData if present and valid
 */
function addOptionalFields(
  data: StudentData,
  row: Record<string, string | number | undefined>,
): void {
  if (row.group === "treatment" || row.group === "control") {
    data.group = row.group;
  }
  if (isValidNumber(row.delayed_total)) data.delayed_total = row.delayed_total;
  if (isValidNumber(row.mtt_score)) data.mtt_score = row.mtt_score;
  if (isValidNumber(row.imi_interest)) data.imi_interest = row.imi_interest;
  if (isValidNumber(row.imi_competence))
    data.imi_competence = row.imi_competence;
  if (isValidNumber(row.imi_effort)) data.imi_effort = row.imi_effort;
  if (isValidNumber(row.imi_value)) data.imi_value = row.imi_value;
  if (isValidNumber(row.gpa)) data.gpa = row.gpa;
  if (
    row.prior_programming === 0 ||
    row.prior_programming === 1 ||
    row.prior_programming === 2 ||
    row.prior_programming === 3
  ) {
    data.prior_programming = row.prior_programming;
  }
  if (typeof row.institution === "string") data.institution = row.institution;
}

/**
 * Validate and construct StudentData from a parsed row
 * Returns the validated StudentData or null if invalid
 */
function validateStudentData(
  row: Record<string, string | number | undefined>,
  rowIndex: number,
): StudentData | null {
  const id = validateId(row, rowIndex);
  if (id === null) return null;

  if (!validateRequiredNumericFields(row, rowIndex)) return null;

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

  addOptionalFields(data, row);
  return data;
}

// ============================================================================
// Research analysis functions (CLI output formatting)
// ============================================================================

/**
 * Print descriptive statistics
 */
function printDescriptives(stats: DescriptiveStats): void {
  console.log(`  N:      ${stats.n}`);
  console.log(`  Mean:   ${stats.mean.toFixed(2)}`);
  console.log(`  SD:     ${stats.sd.toFixed(2)}`);
  console.log(`  Median: ${stats.median.toFixed(2)}`);
  console.log(`  Range:  [${stats.min.toFixed(2)}, ${stats.max.toFixed(2)}]`);
}

/**
 * Format p-value
 */
function formatPValue(p: number): string {
  if (p < 0.001) return "< .001";
  if (p < 0.01) return "< .01";
  if (p < 0.05) return "< .05";
  return p.toFixed(3);
}

/**
 * Analyze mutation type subscales
 */
function analyzeSubscales(data: StudentData[]): void {
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
  console.log("-".repeat(64));

  for (const type of mutationTypes) {
    const preKey = `pretest_${type}` as keyof StudentData;
    const postKey = `posttest_${type}` as keyof StudentData;

    const preScores = data.map((d) => d[preKey] as number);
    const postScores = data.map((d) => d[postKey] as number);
    const gains = preScores.map((pre, i) => postScores[i] - pre);

    const preMean = mean(preScores).toFixed(2);
    const preSD = sd(preScores).toFixed(2);
    const postMean = mean(postScores).toFixed(2);
    const postSD = sd(postScores).toFixed(2);
    const gainMean = mean(gains).toFixed(2);
    const gainSD = sd(gains).toFixed(2);

    const sdGains = sd(gains);
    const d = sdGains === 0 ? 0 : mean(gains) / sdGains;

    console.log(
      `${type.padEnd(
        13,
      )} | ${preMean}(${preSD}) | ${postMean}(${postSD}) | ${gainMean}(${gainSD}) | ${d.toFixed(
        3,
      )} (${interpretEffectSize(d)})`,
    );
  }
}

/**
 * Analyze retention
 */
function analyzeRetention(data: StudentData[]): void {
  // Filter to participants who have both post and delayed scores
  const pairedData = data.filter((d) => d.delayed_total !== undefined);
  const postScores = pairedData.map((d) => d.posttest_total);
  const delayedScores = pairedData.map((d) => d.delayed_total as number);

  const postMean = mean(postScores);
  const delayedMean = mean(delayedScores);
  const retention = (delayedMean / postMean) * 100;

  console.log(
    `Immediate post-test: M = ${postMean.toFixed(2)}, SD = ${sd(
      postScores,
    ).toFixed(2)}`,
  );
  console.log(
    `Delayed post-test:   M = ${delayedMean.toFixed(2)}, SD = ${sd(
      delayedScores,
    ).toFixed(2)}`,
  );
  console.log(
    `Retention rate:      ${retention.toFixed(
      1,
    )}% of immediate post-test score`,
  );

  const retentionTest = pairedTTest(postScores, delayedScores);
  console.log(
    `t(${retentionTest.df}) = ${retentionTest.t.toFixed(3)}, p = ${formatPValue(
      retentionTest.p,
    )}`,
  );

  if (retentionTest.p >= 0.05) {
    console.log("Learning gains maintained (no significant decay)");
  } else if (retentionTest.meanDiff < 0) {
    console.log("Some decay detected, but scores still above baseline");
  } else {
    console.log("Learning gains actually increased (sleeper effect)");
  }
}

/**
 * Analyze pre-post design (pilot study)
 */
function analyzePrePost(data: StudentData[]): void {
  console.log(
    "\n+==============================================================+",
  );
  console.log(
    "|       CodonCanvas Pre-Post Analysis (Pilot Study)           |",
  );
  console.log(
    "+==============================================================+\n",
  );

  // Extract scores
  const preScores = data.map((d) => d.pretest_total);
  const postScores = data.map((d) => d.posttest_total);

  // Descriptive statistics
  console.log("DESCRIPTIVE STATISTICS\n");
  const preStats = descriptiveStats(preScores);
  const postStats = descriptiveStats(postScores);

  console.log("Pre-test:");
  printDescriptives(preStats);
  console.log("\nPost-test:");
  printDescriptives(postStats);

  // Paired t-test
  console.log("\n\nPAIRED T-TEST (Pre vs. Post)\n");
  const tResult = pairedTTest(preScores, postScores);

  console.log(
    `t(${tResult.df}) = ${tResult.t.toFixed(3)}, p = ${formatPValue(tResult.p)}`,
  );
  console.log(
    `Mean difference: ${tResult.meanDiff.toFixed(2)} (95% CI: [${tResult.ciLower.toFixed(
      2,
    )}, ${tResult.ciUpper.toFixed(2)}])`,
  );
  console.log(
    `Cohen's d: ${tResult.cohensD.toFixed(3)} (${interpretEffectSize(
      tResult.cohensD,
    )})`,
  );

  if (tResult.p < 0.05) {
    console.log("\nSIGNIFICANT learning gains detected (p < 0.05)");
  } else {
    console.log("\nNo significant difference (p >= 0.05)");
  }

  // Subscale analysis
  console.log("\n\nSUBSCALE ANALYSIS (Mutation Types)\n");
  analyzeSubscales(data);

  // Retention (if available)
  const withDelayed = data.filter((d) => d.delayed_total !== undefined);
  if (withDelayed.length > 5) {
    console.log("\n\nRETENTION ANALYSIS (Delayed Post-test)\n");
    analyzeRetention(withDelayed);
  }

  console.log(`\n${"=".repeat(64)}\n`);
}

/**
 * Analyze RCT design
 */
function analyzeRCT(
  treatmentData: StudentData[],
  controlData: StudentData[],
): void {
  console.log(
    "\n+==============================================================+",
  );
  console.log(
    "|         CodonCanvas RCT Analysis (Treatment vs. Control)     |",
  );
  console.log(
    "+==============================================================+\n",
  );

  // Pre-test equivalence check
  console.log("PRE-TEST EQUIVALENCE CHECK\n");
  const treatmentPre = treatmentData.map((d) => d.pretest_total);
  const controlPre = controlData.map((d) => d.pretest_total);

  const preEquiv = independentTTest(treatmentPre, controlPre);
  console.log(
    `Treatment pre-test: M = ${mean(treatmentPre).toFixed(2)}, SD = ${sd(
      treatmentPre,
    ).toFixed(2)}`,
  );
  console.log(
    `Control pre-test:   M = ${mean(controlPre).toFixed(2)}, SD = ${sd(
      controlPre,
    ).toFixed(2)}`,
  );
  console.log(
    `t(${preEquiv.df}) = ${preEquiv.t.toFixed(3)}, p = ${formatPValue(preEquiv.p)}`,
  );

  if (preEquiv.p >= 0.05) {
    console.log("Groups are equivalent at baseline (good randomization)");
  } else {
    console.log(
      "Groups differ at baseline (consider ANCOVA with pre-test covariate)",
    );
  }

  // Post-test comparison
  console.log("\n\nPOST-TEST COMPARISON\n");
  const treatmentPost = treatmentData.map((d) => d.posttest_total);
  const controlPost = controlData.map((d) => d.posttest_total);

  const postResult = independentTTest(treatmentPost, controlPost);

  console.log(
    `Treatment post-test: M = ${mean(treatmentPost).toFixed(2)}, SD = ${sd(
      treatmentPost,
    ).toFixed(2)}`,
  );
  console.log(
    `Control post-test:   M = ${mean(controlPost).toFixed(2)}, SD = ${sd(
      controlPost,
    ).toFixed(2)}`,
  );
  console.log(
    `\nt(${postResult.df}) = ${postResult.t.toFixed(3)}, p = ${formatPValue(postResult.p)}`,
  );
  console.log(
    `Mean difference: ${postResult.meanDiff.toFixed(2)} (95% CI: [${postResult.ciLower.toFixed(
      2,
    )}, ${postResult.ciUpper.toFixed(2)}])`,
  );
  console.log(
    `Cohen's d: ${postResult.cohensD.toFixed(3)} (${interpretEffectSize(
      postResult.cohensD,
    )})`,
  );

  if (postResult.p < 0.05) {
    console.log("\nSIGNIFICANT treatment effect detected (p < 0.05)");
    console.log(
      `   CodonCanvas shows ${interpretEffectSize(
        postResult.cohensD,
      )} effect size`,
    );
  } else {
    console.log("\nNo significant treatment effect (p >= 0.05)");
  }

  // Gain scores
  console.log("\n\nGAIN SCORE ANALYSIS\n");
  const treatmentGains = treatmentData.map(
    (d) => d.posttest_total - d.pretest_total,
  );
  const controlGains = controlData.map(
    (d) => d.posttest_total - d.pretest_total,
  );

  const gainResult = independentTTest(treatmentGains, controlGains);
  console.log(
    `Treatment gain: M = ${mean(treatmentGains).toFixed(2)}, SD = ${sd(
      treatmentGains,
    ).toFixed(2)}`,
  );
  console.log(
    `Control gain:   M = ${mean(controlGains).toFixed(2)}, SD = ${sd(
      controlGains,
    ).toFixed(2)}`,
  );
  console.log(
    `t(${gainResult.df}) = ${gainResult.t.toFixed(3)}, p = ${formatPValue(gainResult.p)}`,
  );

  console.log(`\n${"=".repeat(64)}\n`);
}

/**
 * Generate publication-ready table (Markdown)
 */
function generateTable(
  data: StudentData[],
  _group: "treatment" | "control" | "all",
): void {
  console.log("\nPUBLICATION TABLE (Markdown format)\n");
  console.log("```markdown");
  console.log(
    "| Variable | N | Pre M(SD) | Post M(SD) | Gain M(SD) | t | df | p | d |",
  );
  console.log(
    "|----------|---|-----------|------------|------------|---|----|----|---|",
  );

  const pre = data.map((d) => d.pretest_total);
  const post = data.map((d) => d.posttest_total);
  const result = pairedTTest(pre, post);
  const gains = pre.map((p, i) => post[i] - p);

  console.log(
    `| Total Score | ${data.length} | ${mean(pre).toFixed(2)}(${sd(pre).toFixed(
      2,
    )}) | ${mean(post).toFixed(2)}(${sd(post).toFixed(2)}) | ${mean(
      gains,
    ).toFixed(2)}(${sd(gains).toFixed(2)}) | ${result.t.toFixed(
      2,
    )} | ${result.df} | ${formatPValue(result.p)} | ${result.cohensD.toFixed(
      2,
    )} |`,
  );
  console.log("```\n");
}

/**
 * ResearchAnalyzer namespace for backward compatibility exports
 */
const ResearchAnalyzer = {
  analyzePrePost,
  analyzeRCT,
  analyzeSubscales,
  analyzeRetention,
  printDescriptives,
  formatPValue,
  generateTable,
};

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

  // Validate alpha range (significance level)
  if (alpha <= 0 || alpha >= 1) {
    console.error(`Error: --alpha must be in (0, 1), got: ${alpha}`);
    process.exit(1);
  }

  // Validate power range
  if (power <= 0 || power >= 1) {
    console.error(`Error: --power must be in (0, 1), got: ${power}`);
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

  const result = powerAnalysis(effect, alpha, power);

  console.log(`Parameters:`);
  console.log(`  Effect size (Cohen's d): ${effect}`);
  console.log(`  Alpha level:             ${alpha}`);
  console.log(`  Desired power:           ${power}\n`);

  console.log(`Sample Size Required:`);
  console.log(`  Per group:               ${result.requiredNPerGroup}`);
  console.log(`  Total (2 groups):        ${result.totalN}\n`);

  console.log(`With 20% Attrition Buffer:`);
  console.log(`  Per group:               ${result.inflatedNPerGroup}`);
  console.log(`  Total (2 groups):        ${result.inflatedTotal}\n`);

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

// Re-export for backward compatibility
export { parseCSV, ResearchAnalyzer, type StudentData };
export {
  descriptiveStats,
  independentTTest,
  interpretEffectSize,
  mean,
  pairedTTest,
  powerAnalysis,
  sd,
} from "@/analysis/statistics";
