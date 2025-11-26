/**
 * Browser-compatible metrics analyzer core
 * Extracts Stats and MetricsAnalyzer classes from CLI script for dashboard integration
 */

// ============================================================================
// Data Structures
// ============================================================================

export interface MetricsSession {
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

/**
 * Descriptive statistics summary (mean, SD, quartiles, min/max)
 *
 * Standard statistical measures computed from a distribution of values.
 * Enables comparison of learning metrics across different student populations.
 *
 * Fields:
 * - n: sample size
 * - mean: arithmetic average
 * - sd: standard deviation
 * - min/max: range bounds
 * - median: 50th percentile
 * - q1/q3: 25th and 75th percentiles
 */
export interface DescriptiveStats {
  /** Sample size (number of observations) */
  n: number;
  /** Arithmetic mean */
  mean: number;
  /** Standard deviation */
  sd: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Median (50th percentile) */
  median: number;
  /** First quartile (25th percentile) */
  q1: number;
  /** Third quartile (75th percentile) */
  q3: number;
}

/**
 * Classroom-level engagement metrics
 *
 * Aggregated statistics on student participation including session counts,
 * genome creation rates, execution frequency, and retention patterns.
 * Used for classroom-wide learning analytics.
 */
export interface EngagementMetrics {
  totalSessions: number;
  uniqueUsers: number;
  avgSessionDuration: DescriptiveStats;
  totalGenomesCreated: number;
  avgGenomesPerSession: DescriptiveStats;
  genomesExecutedRate: number; // percentage
  retentionRate: number;
}

/**
 * Learning velocity analysis (time to first successful creation)
 *
 * Measures how quickly students begin producing visual output. Fast time-to-artifact
 * indicates pedagogical effectiveness in helping students succeed early and build confidence.
 *
 * Categories:
 * - Fast learners: first artifact < 5 minutes
 * - Moderate learners: 5-15 minutes
 * - Slow learners: > 15 minutes
 * - No artifact: never achieved successful execution
 */
export interface LearningVelocity {
  /** Distribution of time-to-first-artifact across all students */
  timeToFirstArtifact: DescriptiveStats;
  /** Number of students achieving artifact in < 5 minutes */
  fastLearners: number;
  /** Number of students achieving artifact in 5-15 minutes */
  moderateLearners: number;
  /** Number of students achieving artifact in > 15 minutes */
  slowLearners: number;
  /** Number of students never achieving successful execution */
  noArtifact: number;
}

/**
 * Feature adoption statistics (tool usage across classroom)
 *
 * Tracks which advanced features (diff viewer, timeline, evolution engine, etc.)
 * students actually use, enabling instructors to identify under-utilized tools
 * and adjust pedagogy accordingly.
 */
export interface ToolAdoption {
  diffViewer: { users: number; avgUsage: number };
  timeline: { users: number; avgUsage: number };
  evolution: { users: number; avgUsage: number };
  assessment: { users: number; avgUsage: number };
  export: { users: number; avgUsage: number };
}

/**
 * Render mode usage preferences across classroom
 *
 * Tracks student preference for visual drawing, audio synthesis, or multimodal
 * (both) rendering modes. Indicates engagement with different sensory modalities.
 */
export interface RenderModePreferences {
  /** Sessions using visual-only rendering */
  visualOnly: { sessions: number; percentage: number };
  /** Sessions using audio-only rendering */
  audioOnly: { sessions: number; percentage: number };
  /** Sessions using multimodal (visual + audio) rendering */
  multiSensory: { sessions: number; percentage: number };
}

/**
 * Mutation type usage patterns (distribution and frequency)
 *
 * Breaks down mutation application frequency by type (silent, missense, nonsense,
 * frameshift, point, insertion, deletion) with descriptive statistics.
 * Shows which mutation types students explore most.
 */
export interface MutationPatterns {
  silent: DescriptiveStats;
  missense: DescriptiveStats;
  nonsense: DescriptiveStats;
  frameshift: DescriptiveStats;
  point: DescriptiveStats;
  insertion: DescriptiveStats;
  deletion: DescriptiveStats;
  totalMutations: number;
}

/**
 * Statistical comparison result between two groups
 *
 * T-test result comparing a metric between two student groups (e.g., comparing
 * achievement rates between different learning pathway cohorts). Includes effect size
 * (Cohen's d) and statistical interpretation for validity assessment.
 *
 * Interpretation ranges:
 * - p < 0.05: Statistically significant difference
 * - Cohen's d: 0.2 (small), 0.5 (medium), 0.8+ (large) effect
 */
export interface ComparisonResult {
  /** Label for first group (e.g., "Control") */
  group1: string;
  /** Label for second group (e.g., "Treatment") */
  group2: string;
  /** Which metric was compared (e.g., "time-to-artifact") */
  metric: string;
  /** Mean value for group 1 */
  group1Mean: number;
  /** Mean value for group 2 */
  group2Mean: number;
  /** Absolute difference between means */
  diff: number;
  /** Percentage change from group1 to group2 */
  percentChange: number;
  /** T-test statistic */
  t: number;
  /** P-value (significance level, <0.05 is significant) */
  p: number;
  /** Cohen's d effect size (0.2 small, 0.5 medium, 0.8 large) */
  cohensD: number;
  /** Human-readable interpretation of results */
  interpretation: string;
}

/**
 * Complete classroom analytics report
 *
 * Aggregates all metrics (engagement, learning velocity, tool adoption,
 * render modes, mutation patterns) into a single comprehensive report.
 * Used by teacher dashboard for classroom-wide analysis.
 */
export interface AnalysisReport {
  engagement: EngagementMetrics;
  velocity: LearningVelocity;
  tools: ToolAdoption;
  renderMode: RenderModePreferences;
  mutations: MutationPatterns;
}

// ============================================================================
// Statistical Functions
// ============================================================================

/**
 * Static utility methods for statistical calculations
 *
 * Provides standard descriptive statistics functions (mean, SD, median, quartiles)
 * used to summarize distributions of learning metrics across student populations.
 * All methods handle empty arrays gracefully by returning 0.
 *
 * @example
 * ```typescript
 * const values = [10, 20, 30, 40, 50];
 * const mean = Stats.mean(values); // 30
 * const sd = Stats.sd(values); // 15.8
 * const median = Stats.median(values); // 30
 * const q1 = Stats.quartile(values, 1); // 20
 * ```
 */
export class Stats {
  static mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static sd(values: number[], sample = true): number {
    if (values.length === 0) return 0;
    const m = Stats.mean(values);
    const divisor = sample ? values.length - 1 : values.length;
    const variance = values.reduce((sum, val) => sum + (val - m) ** 2, 0) /
      divisor;
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

    const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
    const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

    const t = (m1 - m2) / se;
    const df = n1 + n2 - 2;

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
   */
  static tDistribution(t: number, df: number): number {
    if (df > 30) {
      return 2 * (1 - Stats.normalCDF(t));
    }

    const x = df / (df + t * t);
    const p = 1 - 0.5 * x ** (df / 2);
    return 2 * Math.min(p, 1 - p);
  }

  /**
   * Standard normal CDF
   */
  static normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  static interpretEffectSize(d: number): string {
    const abs = Math.abs(d);
    if (abs < 0.2) return "negligible";
    if (abs < 0.5) return "small";
    if (abs < 0.8) return "medium";
    return "large";
  }

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

/**
 * Metrics Analyzer - Aggregates and analyzes learning metrics from sessions
 *
 * Processes individual student sessions (exported ResearchSession data) to produce
 * comprehensive classroom-level analytics reports. Computes descriptive statistics,
 * engagement metrics, learning velocity, feature adoption, and enables group comparisons.
 *
 * Used by teacher dashboard to answer research questions:
 * - RQ2: How does different pedagogy affect engagement?
 * - RQ3: Do visual/audio modes differ in effectiveness?
 * - RQ4: Which features are most adopted?
 *
 * Features:
 * - Aggregates multiple student sessions into cohort statistics
 * - Compares metrics between student groups (e.g., control vs treatment)
 * - Analyzes learning velocity (time to first success)
 * - Tracks feature adoption patterns
 * - Computes mutation type preferences
 *
 * @example
 * ```typescript
 * const analyzer = new MetricsAnalyzer(sessions);
 * const engagement = analyzer.engagementMetrics();
 * const velocity = analyzer.learningVelocity();
 * const report = analyzer.generateReport();
 *
 * const comparison = analyzer.compareGroups(
 *   sessions.filter(s => s.treatment === 'A'),
 *   sessions.filter(s => s.treatment === 'B'),
 *   'time-to-first-artifact'
 * );
 * ```
 */
export class MetricsAnalyzer {
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
      uniqueUsers: 1,
      avgSessionDuration: Stats.descriptive(durations),
      totalGenomesCreated: totalGenomes,
      avgGenomesPerSession: Stats.descriptive(genomes),
      genomesExecutedRate: totalGenomes > 0
        ? (totalExecuted / totalGenomes) * 100
        : 0,
      retentionRate: this.sessions.length > 1 ? 100 : 0,
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
   * Generate complete analysis report
   */
  generateReport(): AnalysisReport {
    return {
      engagement: this.engagementMetrics(),
      velocity: this.learningVelocity(),
      tools: this.toolAdoption(),
      renderMode: this.renderModePreferences(),
      mutations: this.mutationPatterns(),
    };
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
// CSV Parsing (Browser-compatible)
// ============================================================================

/**
 * Parse CSV string into MetricsSession objects
 */
export function parseCSVContent(content: string): MetricsSession[] {
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
        session[key] = value === "null" || value === ""
          ? null
          : parseFloat(value);
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

    if (char === "\"") {
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
// Formatting Utilities
// ============================================================================

/**
 * Format milliseconds to human-readable duration string
 *
 * Converts milliseconds to appropriate unit (hours, minutes, seconds).
 * Used to display session duration and time-to-first-artifact metrics
 * in dashboard and reports.
 *
 * @param ms - Milliseconds to format
 * @returns Formatted string like "2h 30m", "5m 30s", or "45s"
 * @example
 * ```typescript
 * formatDuration(90000); // "1m 30s"
 * formatDuration(3661000); // "1h 1m"
 * ```
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format percentage value to string with 1 decimal place
 *
 * @param value - Percentage value (0-100)
 * @returns Formatted string like "85.5%"
 * @example
 * ```typescript
 * formatPercentage(85.5); // "85.5%"
 * formatPercentage(100); // "100.0%"
 * ```
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format numeric value with specified decimal places
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with specified precision
 * @example
 * ```typescript
 * formatNumber(3.14159); // "3.1"
 * formatNumber(3.14159, 2); // "3.14"
 * formatNumber(42, 0); // "42"
 * ```
 */
export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}
