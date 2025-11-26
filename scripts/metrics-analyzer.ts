#!/usr/bin/env tsx
/**
 * CodonCanvas Metrics Analyzer
 *
 * Automates statistical analysis of usage metrics exported from ResearchMetrics system.
 * Analyzes engagement patterns, learning velocity, tool adoption, and render mode preferences.
 *
 * Features:
 * - Descriptive statistics (mean, SD, median, range, quartiles)
 * - Engagement metrics (session duration trends, retention analysis)
 * - Learning velocity (time-to-first-artifact distribution)
 * - Tool adoption patterns (feature usage frequencies)
 * - Render mode preferences (visual vs audio vs multi-sensory)
 * - Multi-sensory RCT analysis (compare groups)
 * - Publication-ready tables and visualizations
 *
 * Usage:
 *   npm run metrics:analyze -- --data metrics.csv
 *   npm run metrics:analyze -- --data metrics.csv --group visual --baseline audio
 *   npm run metrics:analyze -- --data metrics.csv --report full
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ============================================================================
// Data Structures
// ============================================================================

interface MetricsSession {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number; // milliseconds
  genomesCreated: number;
  genomesExecuted: number;
  timeToFirstArtifact: number | null; // milliseconds
  mutationsApplied: number;
  renderMode_visual: number;
  renderMode_audio: number;
  renderMode_both: number;
  mutation_silent: number;
  mutation_missense: number;
  mutation_nonsense: number;
  mutation_frameshift: number;
  mutation_point: number;
  mutation_insertion: number;
  mutation_deletion: number;
  feature_diffViewer: number;
  feature_timeline: number;
  feature_evolution: number;
  feature_assessment: number;
  feature_export: number;
  errorCount: number;
  errorTypes: string; // JSON array
}

interface DescriptiveStats {
  n: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
  median: number;
  q1: number;
  q3: number;
}

interface EngagementMetrics {
  totalSessions: number;
  uniqueUsers: number; // always 1 for single-browser export
  avgSessionDuration: DescriptiveStats;
  totalGenomesCreated: number;
  avgGenomesPerSession: DescriptiveStats;
  genomesExecutedRate: number; // percentage
  retentionRate: number; // percentage with >1 session
}

interface LearningVelocity {
  timeToFirstArtifact: DescriptiveStats;
  fastLearners: number; // <5 minutes
  moderateLearners: number; // 5-15 minutes
  slowLearners: number; // >15 minutes
  noArtifact: number; // never succeeded
}

interface ToolAdoption {
  diffViewer: { users: number; avgUsage: number };
  timeline: { users: number; avgUsage: number };
  evolution: { users: number; avgUsage: number };
  assessment: { users: number; avgUsage: number };
  export: { users: number; avgUsage: number };
}

interface RenderModePreferences {
  visualOnly: { sessions: number; percentage: number };
  audioOnly: { sessions: number; percentage: number };
  multiSensory: { sessions: number; percentage: number };
}

interface MutationPatterns {
  silent: DescriptiveStats;
  missense: DescriptiveStats;
  nonsense: DescriptiveStats;
  frameshift: DescriptiveStats;
  point: DescriptiveStats;
  insertion: DescriptiveStats;
  deletion: DescriptiveStats;
  totalMutations: number;
}

interface ComparisonResult {
  group1: string;
  group2: string;
  metric: string;
  group1Mean: number;
  group2Mean: number;
  diff: number;
  percentChange: number;
  t: number;
  p: number;
  cohensD: number;
  interpretation: string;
}

// ============================================================================
// Statistical Functions
// ============================================================================

class Stats {
  static mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static sd(values: number[], sample = true): number {
    if (values.length === 0) return 0;
    const m = Stats.mean(values);
    const divisor = sample ? values.length - 1 : values.length;
    const variance =
      values.reduce((sum, val) => sum + (val - m) ** 2, 0) / divisor;
    return Math.sqrt(variance);
  }

  static median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static quartile(values: number[], q: 1 | 3): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const pos = q === 1 ? 0.25 : 0.75;
    const index = pos * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  static min(values: number[]): number {
    return values.length > 0 ? Math.min(...values) : 0;
  }

  static max(values: number[]): number {
    return values.length > 0 ? Math.max(...values) : 0;
  }

  static descriptive(values: number[]): DescriptiveStats {
    return {
      n: values.length,
      mean: Stats.mean(values),
      sd: Stats.sd(values),
      min: Stats.min(values),
      max: Stats.max(values),
      median: Stats.median(values),
      q1: Stats.quartile(values, 1),
      q3: Stats.quartile(values, 3),
    };
  }

  /**
   * Independent samples t-test
   */
  static tTest(
    group1: number[],
    group2: number[],
  ): { t: number; df: number; p: number } {
    const n1 = group1.length;
    const n2 = group2.length;
    const m1 = Stats.mean(group1);
    const m2 = Stats.mean(group2);
    const v1 = Stats.sd(group1) ** 2;
    const v2 = Stats.sd(group2) ** 2;

    // Pooled standard deviation
    const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
    const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

    const t = (m1 - m2) / se;
    const df = n1 + n2 - 2;

    // Approximate p-value (two-tailed)
    const p = Stats.tDistribution(Math.abs(t), df);

    return { t, df, p };
  }

  /**
   * Cohen's d effect size
   */
  static cohensD(group1: number[], group2: number[]): number {
    const n1 = group1.length;
    const n2 = group2.length;
    const m1 = Stats.mean(group1);
    const m2 = Stats.mean(group2);
    const v1 = Stats.sd(group1) ** 2;
    const v2 = Stats.sd(group2) ** 2;

    const pooledSD = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
    return (m1 - m2) / pooledSD;
  }

  /**
   * Approximate two-tailed p-value from t-distribution
   * Uses normal approximation for df > 30, otherwise simplified calculation
   */
  static tDistribution(t: number, df: number): number {
    if (df > 30) {
      // Normal approximation
      return 2 * (1 - Stats.normalCDF(t));
    }

    // Simplified t-distribution approximation
    const x = df / (df + t * t);
    const p = 1 - 0.5 * x ** (df / 2);
    return 2 * Math.min(p, 1 - p);
  }

  /**
   * Standard normal CDF (cumulative distribution function)
   */
  static normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  /**
   * Interpret Cohen's d effect size
   */
  static interpretEffectSize(d: number): string {
    const abs = Math.abs(d);
    if (abs < 0.2) return "negligible";
    if (abs < 0.5) return "small";
    if (abs < 0.8) return "medium";
    return "large";
  }

  /**
   * Interpret p-value significance
   */
  static interpretPValue(p: number): string {
    if (p < 0.001) return "highly significant (p < .001)";
    if (p < 0.01) return "very significant (p < .01)";
    if (p < 0.05) return "significant (p < .05)";
    if (p < 0.1) return "marginally significant (p < .10)";
    return "not significant (p ≥ .10)";
  }
}

// ============================================================================
// Metrics Analyzer
// ============================================================================

class MetricsAnalyzer {
  private sessions: MetricsSession[] = [];

  constructor(sessions: MetricsSession[]) {
    this.sessions = sessions;
  }

  /**
   * Calculate engagement metrics
   */
  engagementMetrics(): EngagementMetrics {
    const durations = this.sessions.map((s) => s.duration);
    const genomes = this.sessions.map((s) => s.genomesCreated);
    const totalGenomes = this.sessions.reduce(
      (sum, s) => sum + s.genomesCreated,
      0,
    );
    const totalExecuted = this.sessions.reduce(
      (sum, s) => sum + s.genomesExecuted,
      0,
    );

    return {
      totalSessions: this.sessions.length,
      uniqueUsers: 1, // Single-browser export assumption
      avgSessionDuration: Stats.descriptive(durations),
      totalGenomesCreated: totalGenomes,
      avgGenomesPerSession: Stats.descriptive(genomes),
      genomesExecutedRate:
        totalGenomes > 0 ? (totalExecuted / totalGenomes) * 100 : 0,
      retentionRate: this.sessions.length > 1 ? 100 : 0, // Placeholder for multi-user
    };
  }

  /**
   * Calculate learning velocity metrics
   */
  learningVelocity(): LearningVelocity {
    const ttfa = this.sessions
      .map((s) => s.timeToFirstArtifact)
      .filter((t): t is number => t !== null);

    const FIVE_MIN = 5 * 60 * 1000;
    const FIFTEEN_MIN = 15 * 60 * 1000;

    return {
      timeToFirstArtifact: Stats.descriptive(ttfa),
      fastLearners: ttfa.filter((t) => t < FIVE_MIN).length,
      moderateLearners: ttfa.filter((t) => t >= FIVE_MIN && t < FIFTEEN_MIN)
        .length,
      slowLearners: ttfa.filter((t) => t >= FIFTEEN_MIN).length,
      noArtifact: this.sessions.filter((s) => s.timeToFirstArtifact === null)
        .length,
    };
  }

  /**
   * Calculate tool adoption patterns
   */
  toolAdoption(): ToolAdoption {
    const tools = [
      "diffViewer",
      "timeline",
      "evolution",
      "assessment",
      "export",
    ] as const;
    const result: any = {};

    for (const tool of tools) {
      const key = `feature_${tool}` as keyof MetricsSession;
      const usage = this.sessions.map((s) => s[key] as number);
      const users = usage.filter((u) => u > 0).length;
      const avgUsage = Stats.mean(usage);

      result[tool] = { users, avgUsage };
    }

    return result as ToolAdoption;
  }

  /**
   * Calculate render mode preferences
   */
  renderModePreferences(): RenderModePreferences {
    const totalExecutions = this.sessions.reduce(
      (sum, s) =>
        sum + s.renderMode_visual + s.renderMode_audio + s.renderMode_both,
      0,
    );

    const visual = this.sessions.reduce(
      (sum, s) => sum + s.renderMode_visual,
      0,
    );
    const audio = this.sessions.reduce((sum, s) => sum + s.renderMode_audio, 0);
    const both = this.sessions.reduce((sum, s) => sum + s.renderMode_both, 0);

    return {
      visualOnly: {
        sessions: visual,
        percentage: totalExecutions > 0 ? (visual / totalExecutions) * 100 : 0,
      },
      audioOnly: {
        sessions: audio,
        percentage: totalExecutions > 0 ? (audio / totalExecutions) * 100 : 0,
      },
      multiSensory: {
        sessions: both,
        percentage: totalExecutions > 0 ? (both / totalExecutions) * 100 : 0,
      },
    };
  }

  /**
   * Calculate mutation patterns
   */
  mutationPatterns(): MutationPatterns {
    const types = [
      "silent",
      "missense",
      "nonsense",
      "frameshift",
      "point",
      "insertion",
      "deletion",
    ] as const;
    const result: any = {};
    let total = 0;

    for (const type of types) {
      const key = `mutation_${type}` as keyof MetricsSession;
      const values = this.sessions.map((s) => s[key] as number);
      result[type] = Stats.descriptive(values);
      total += values.reduce((sum, v) => sum + v, 0);
    }

    result.totalMutations = total;
    return result as MutationPatterns;
  }

  /**
   * Compare two groups (for RCT analysis)
   */
  compareGroups(
    group1Sessions: MetricsSession[],
    group2Sessions: MetricsSession[],
    group1Name: string,
    group2Name: string,
  ): ComparisonResult[] {
    const results: ComparisonResult[] = [];

    // Compare session duration
    const dur1 = group1Sessions.map((s) => s.duration);
    const dur2 = group2Sessions.map((s) => s.duration);
    if (dur1.length > 0 && dur2.length > 0) {
      results.push(
        this.createComparison(
          group1Name,
          group2Name,
          "Session Duration (min)",
          dur1.map((d) => d / 60000),
          dur2.map((d) => d / 60000),
        ),
      );
    }

    // Compare genomes created
    const gen1 = group1Sessions.map((s) => s.genomesCreated);
    const gen2 = group2Sessions.map((s) => s.genomesCreated);
    if (gen1.length > 0 && gen2.length > 0) {
      results.push(
        this.createComparison(
          group1Name,
          group2Name,
          "Genomes Created",
          gen1,
          gen2,
        ),
      );
    }

    // Compare time to first artifact
    const ttfa1 = group1Sessions
      .map((s) => s.timeToFirstArtifact)
      .filter((t): t is number => t !== null);
    const ttfa2 = group2Sessions
      .map((s) => s.timeToFirstArtifact)
      .filter((t): t is number => t !== null);
    if (ttfa1.length > 0 && ttfa2.length > 0) {
      results.push(
        this.createComparison(
          group1Name,
          group2Name,
          "Time to First Artifact (min)",
          ttfa1.map((t) => t / 60000),
          ttfa2.map((t) => t / 60000),
        ),
      );
    }

    // Compare mutations applied
    const mut1 = group1Sessions.map((s) => s.mutationsApplied);
    const mut2 = group2Sessions.map((s) => s.mutationsApplied);
    if (mut1.length > 0 && mut2.length > 0) {
      results.push(
        this.createComparison(
          group1Name,
          group2Name,
          "Mutations Applied",
          mut1,
          mut2,
        ),
      );
    }

    return results;
  }

  private createComparison(
    group1: string,
    group2: string,
    metric: string,
    values1: number[],
    values2: number[],
  ): ComparisonResult {
    const m1 = Stats.mean(values1);
    const m2 = Stats.mean(values2);
    const { t, df, p } = Stats.tTest(values1, values2);
    const d = Stats.cohensD(values1, values2);

    return {
      group1,
      group2,
      metric,
      group1Mean: m1,
      group2Mean: m2,
      diff: m1 - m2,
      percentChange: m2 !== 0 ? ((m1 - m2) / m2) * 100 : 0,
      t,
      p,
      cohensD: d,
      interpretation: Stats.interpretEffectSize(d),
    };
  }
}

// ============================================================================
// CSV Parsing
// ============================================================================

function parseCSV(filepath: string): MetricsSession[] {
  const content = fs.readFileSync(filepath, "utf-8");
  const lines = content.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV file is empty or missing header");
  }

  const header = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"(.*)"$/, "$1"));
  const sessions: MetricsSession[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const session: any = {};

    header.forEach((key, idx) => {
      const value = values[idx];

      // Parse numbers
      if (
        key === "duration" ||
        key === "startTime" ||
        key === "endTime" ||
        key.startsWith("genomes") ||
        key.startsWith("mutation") ||
        key.startsWith("renderMode") ||
        key.startsWith("feature") ||
        key === "mutationsApplied" ||
        key === "errorCount"
      ) {
        session[key] = parseFloat(value) || 0;
      } else if (key === "timeToFirstArtifact") {
        session[key] =
          value === "null" || value === "" ? null : parseFloat(value);
      } else {
        session[key] = value;
      }
    });

    sessions.push(session as MetricsSession);
  }

  return sessions;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map((v) => v.replace(/^"(.*)"$/, "$1"));
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport(analyzer: MetricsAnalyzer, outputPath: string): void {
  const engagement = analyzer.engagementMetrics();
  const velocity = analyzer.learningVelocity();
  const tools = analyzer.toolAdoption();
  const renderMode = analyzer.renderModePreferences();
  const mutations = analyzer.mutationPatterns();

  let report = "";

  report +=
    "═══════════════════════════════════════════════════════════════════\n";
  report += "           CODONCANVAS METRICS ANALYSIS REPORT\n";
  report +=
    "═══════════════════════════════════════════════════════════════════\n\n";

  // Engagement Metrics
  report +=
    "───────────────────────────────────────────────────────────────────\n";
  report += "1. ENGAGEMENT METRICS\n";
  report +=
    "───────────────────────────────────────────────────────────────────\n\n";
  report += `Total Sessions:              ${engagement.totalSessions}\n`;
  report += `Average Session Duration:    ${formatDuration(
    engagement.avgSessionDuration.mean,
  )}\n`;
  report += `  (SD = ${formatDuration(
    engagement.avgSessionDuration.sd,
  )}, Range: ${formatDuration(engagement.avgSessionDuration.min)} - ${formatDuration(
    engagement.avgSessionDuration.max,
  )})\n\n`;
  report += `Total Genomes Created:       ${engagement.totalGenomesCreated}\n`;
  report += `Avg Genomes per Session:     ${engagement.avgGenomesPerSession.mean.toFixed(
    1,
  )}\n`;
  report += `  (SD = ${engagement.avgGenomesPerSession.sd.toFixed(1)})\n`;
  report += `Genome Execution Rate:       ${engagement.genomesExecutedRate.toFixed(
    1,
  )}%\n\n`;

  // Learning Velocity
  report +=
    "───────────────────────────────────────────────────────────────────\n";
  report += "2. LEARNING VELOCITY\n";
  report +=
    "───────────────────────────────────────────────────────────────────\n\n";
  report += `Time to First Artifact:\n`;
  report += `  Mean:     ${formatDuration(
    velocity.timeToFirstArtifact.mean,
  )}\n`;
  report += `  Median:   ${formatDuration(
    velocity.timeToFirstArtifact.median,
  )}\n`;
  report += `  SD:       ${formatDuration(velocity.timeToFirstArtifact.sd)}\n`;
  report += `  Range:    ${formatDuration(
    velocity.timeToFirstArtifact.min,
  )} - ${formatDuration(velocity.timeToFirstArtifact.max)}\n\n`;
  report += `Learner Distribution:\n`;
  report += `  Fast (<5 min):       ${velocity.fastLearners} (${(
    (velocity.fastLearners / engagement.totalSessions) * 100
  ).toFixed(1)}%)\n`;
  report += `  Moderate (5-15 min): ${velocity.moderateLearners} (${(
    (velocity.moderateLearners / engagement.totalSessions) * 100
  ).toFixed(1)}%)\n`;
  report += `  Slow (>15 min):      ${velocity.slowLearners} (${(
    (velocity.slowLearners / engagement.totalSessions) * 100
  ).toFixed(1)}%)\n`;
  report += `  No Artifact:         ${velocity.noArtifact} (${(
    (velocity.noArtifact / engagement.totalSessions) * 100
  ).toFixed(1)}%)\n\n`;

  // Tool Adoption
  report +=
    "───────────────────────────────────────────────────────────────────\n";
  report += "3. TOOL ADOPTION\n";
  report +=
    "───────────────────────────────────────────────────────────────────\n\n";
  report += formatToolRow(
    "Diff Viewer",
    tools.diffViewer,
    engagement.totalSessions,
  );
  report += formatToolRow(
    "Timeline Scrubber",
    tools.timeline,
    engagement.totalSessions,
  );
  report += formatToolRow(
    "Evolution Lab",
    tools.evolution,
    engagement.totalSessions,
  );
  report += formatToolRow(
    "Assessment System",
    tools.assessment,
    engagement.totalSessions,
  );
  report += formatToolRow(
    "Export Features",
    tools.export,
    engagement.totalSessions,
  );
  report += "\n";

  // Render Mode Preferences
  report +=
    "───────────────────────────────────────────────────────────────────\n";
  report += "4. RENDER MODE PREFERENCES\n";
  report +=
    "───────────────────────────────────────────────────────────────────\n\n";
  report += `Visual Only:         ${renderMode.visualOnly.percentage.toFixed(
    1,
  )}% (${renderMode.visualOnly.sessions} executions)\n`;
  report += `Audio Only:          ${renderMode.audioOnly.percentage.toFixed(
    1,
  )}% (${renderMode.audioOnly.sessions} executions)\n`;
  report += `Multi-Sensory:       ${renderMode.multiSensory.percentage.toFixed(
    1,
  )}% (${renderMode.multiSensory.sessions} executions)\n\n`;

  // Mutation Patterns
  report +=
    "───────────────────────────────────────────────────────────────────\n";
  report += "5. MUTATION PATTERNS\n";
  report +=
    "───────────────────────────────────────────────────────────────────\n\n";
  report += `Total Mutations Applied:     ${mutations.totalMutations}\n\n`;
  report += formatMutationRow(
    "Silent",
    mutations.silent,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Missense",
    mutations.missense,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Nonsense",
    mutations.nonsense,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Frameshift",
    mutations.frameshift,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Point",
    mutations.point,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Insertion",
    mutations.insertion,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Deletion",
    mutations.deletion,
    mutations.totalMutations,
  );

  report +=
    "\n═══════════════════════════════════════════════════════════════════\n";
  report += "                         END OF REPORT\n";
  report +=
    "═══════════════════════════════════════════════════════════════════\n";

  fs.writeFileSync(outputPath, report);
  console.log(`\n✅ Report generated: ${outputPath}\n`);
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function formatToolRow(
  name: string,
  data: { users: number; avgUsage: number },
  total: number,
): string {
  const adoption = (data.users / total) * 100;
  return `${name.padEnd(20)} ${adoption.toFixed(1)}% adoption (avg ${data.avgUsage.toFixed(
    1,
  )} uses/session)\n`;
}

function formatMutationRow(
  name: string,
  stats: DescriptiveStats,
  total: number,
): string {
  const sum = stats.mean * stats.n;
  const percentage = total > 0 ? (sum / total) * 100 : 0;
  return `  ${name.padEnd(12)} ${percentage.toFixed(1)}% (M=${stats.mean.toFixed(
    1,
  )}, SD=${stats.sd.toFixed(1)})\n`;
}

function generateComparisonReport(
  comparisons: ComparisonResult[],
  outputPath: string,
): void {
  let report = "";

  report +=
    "═══════════════════════════════════════════════════════════════════\n";
  report += "           GROUP COMPARISON ANALYSIS (RCT)\n";
  report +=
    "═══════════════════════════════════════════════════════════════════\n\n";

  for (const comp of comparisons) {
    report += `───────────────────────────────────────────────────────────────────\n`;
    report += `${comp.metric}\n`;
    report += `───────────────────────────────────────────────────────────────────\n\n`;
    report += `${comp.group1}:  M = ${comp.group1Mean.toFixed(2)}\n`;
    report += `${comp.group2}:  M = ${comp.group2Mean.toFixed(2)}\n`;
    report += `Difference:      ${comp.diff > 0 ? "+" : ""}${comp.diff.toFixed(
      2,
    )} (${comp.percentChange > 0 ? "+" : ""}${comp.percentChange.toFixed(
      1,
    )}%)\n\n`;
    report += `t-test:          t = ${comp.t.toFixed(3)}, p = ${comp.p.toFixed(
      4,
    )}\n`;
    report += `Effect Size:     Cohen's d = ${comp.cohensD.toFixed(
      3,
    )} (${comp.interpretation})\n`;
    report += `Interpretation:  ${Stats.interpretPValue(comp.p)}\n\n`;
  }

  report +=
    "═══════════════════════════════════════════════════════════════════\n";

  fs.writeFileSync(outputPath, report);
  console.log(`\n✅ Comparison report generated: ${outputPath}\n`);
}

// ============================================================================
// CLI Interface
// ============================================================================

function printUsage() {
  console.log(`
CodonCanvas Metrics Analyzer

USAGE:
  npm run metrics:analyze -- --data <file> [options]

OPTIONS:
  --data <file>           Input CSV file exported from research dashboard
  --group <name>          Group name for RCT comparison
  --baseline <file>       Baseline group CSV for comparison
  --report <type>         Report type: basic|full (default: full)
  --output <path>         Output directory (default: current directory)

EXAMPLES:
  # Basic analysis
  npm run metrics:analyze -- --data pilot_study.csv

  # RCT comparison (visual vs audio groups)
  npm run metrics:analyze -- --data visual_group.csv --group visual --baseline audio_group.csv

  # Custom output location
  npm run metrics:analyze -- --data study1.csv --output ./results/

CSV FORMAT:
  Expects CSV exported from ResearchMetrics.exportCSV() with columns:
  sessionId, startTime, endTime, duration, genomesCreated, genomesExecuted,
  timeToFirstArtifact, mutationsApplied, renderMode_*, mutation_*, feature_*, etc.

STATISTICAL METHODS:
  - Descriptive statistics (M, SD, median, quartiles, range)
  - Independent samples t-test (group comparisons)
  - Cohen's d effect size
  - Engagement metrics (session duration, retention, productivity)
  - Learning velocity (time-to-first-artifact distribution)
  - Tool adoption rates (feature usage patterns)
  `);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  // Parse arguments
  let dataFile = "";
  let groupName = "Group 1";
  let baselineFile = "";
  let _reportType = "full";
  let outputDir = ".";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--data" && i + 1 < args.length) {
      dataFile = args[++i];
    } else if (args[i] === "--group" && i + 1 < args.length) {
      groupName = args[++i];
    } else if (args[i] === "--baseline" && i + 1 < args.length) {
      baselineFile = args[++i];
    } else if (args[i] === "--report" && i + 1 < args.length) {
      _reportType = args[++i];
    } else if (args[i] === "--output" && i + 1 < args.length) {
      outputDir = args[++i];
    }
  }

  if (!dataFile) {
    console.error("❌ Error: --data <file> is required\n");
    printUsage();
    process.exit(1);
  }

  if (!fs.existsSync(dataFile)) {
    console.error(`❌ Error: Data file not found: ${dataFile}\n`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("\n📊 CodonCanvas Metrics Analyzer\n");
  console.log(`Data file: ${dataFile}`);

  try {
    // Parse CSV
    console.log("Parsing CSV...");
    const sessions = parseCSV(dataFile);
    console.log(`✓ Loaded ${sessions.length} sessions\n`);

    // Create analyzer
    const analyzer = new MetricsAnalyzer(sessions);

    // Generate report
    const baseName = path.basename(dataFile, ".csv");
    const reportPath = path.join(outputDir, `${baseName}_report.txt`);
    console.log("Generating analysis report...");
    generateReport(analyzer, reportPath);

    // Group comparison if baseline provided
    if (baselineFile) {
      if (!fs.existsSync(baselineFile)) {
        console.error(`❌ Warning: Baseline file not found: ${baselineFile}`);
      } else {
        console.log(`\nComparing with baseline: ${baselineFile}`);
        const baselineSessions = parseCSV(baselineFile);
        console.log(`✓ Loaded ${baselineSessions.length} baseline sessions\n`);

        const comparisons = analyzer.compareGroups(
          sessions,
          baselineSessions,
          groupName,
          "Baseline",
        );

        const comparisonPath = path.join(
          outputDir,
          `${baseName}_comparison.txt`,
        );
        generateComparisonReport(comparisons, comparisonPath);
      }
    }

    // Export JSON stats
    const statsPath = path.join(outputDir, `${baseName}_stats.json`);
    const stats = {
      engagement: analyzer.engagementMetrics(),
      velocity: analyzer.learningVelocity(),
      tools: analyzer.toolAdoption(),
      renderMode: analyzer.renderModePreferences(),
      mutations: analyzer.mutationPatterns(),
    };
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`✅ Stats JSON exported: ${statsPath}\n`);

    console.log("✨ Analysis complete!\n");
  } catch (error) {
    console.error(`\n❌ Error during analysis: ${error}\n`);
    process.exit(1);
  }
}

// ============================================================================
// Exports for Testing
// ============================================================================

export { MetricsAnalyzer, type MetricsSession, parseCSV, Stats };

// Run if called directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
