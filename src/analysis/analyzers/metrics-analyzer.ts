/**
 * Metrics Analyzer - Aggregates and analyzes learning metrics from sessions
 */

import {
  LEARNING_VELOCITY,
  MS_PER_MINUTE,
  MUTATION_TYPES,
  TOOL_FEATURES,
} from "@/analysis/constants";
import { descriptiveStats, sum } from "@/analysis/statistics/descriptive";
import {
  cohensD,
  interpretEffectSize,
  tTest,
} from "@/analysis/statistics/inferential";
import type { MetricsSession } from "@/analysis/types/metrics-session";
import type {
  AnalysisReport,
  EngagementMetrics,
  LearningVelocity,
  MutationPatterns,
  RenderModePreferences,
  ToolAdoption,
} from "@/analysis/types/report";
import type { ComparisonResult } from "@/analysis/types/statistics";

/**
 * Metrics Analyzer - Aggregates and analyzes learning metrics from sessions
 *
 * Processes individual student sessions to produce comprehensive
 * classroom-level analytics reports.
 */
export class MetricsAnalyzer {
  constructor(private readonly sessions: readonly MetricsSession[]) {}

  /**
   * Calculate engagement metrics
   */
  engagementMetrics(): EngagementMetrics {
    const durations = this.sessions.map((s) => s.duration);
    const genomes = this.sessions.map((s) => s.genomesCreated);
    const totalGenomes = sum(this.sessions.map((s) => s.genomesCreated));
    const totalExecuted = sum(this.sessions.map((s) => s.genomesExecuted));
    const uniqueSessionIds = new Set(this.sessions.map((s) => s.sessionId));

    return {
      totalSessions: this.sessions.length,
      uniqueUsers: uniqueSessionIds.size,
      avgSessionDuration: descriptiveStats(durations),
      totalGenomesCreated: totalGenomes,
      avgGenomesPerSession: descriptiveStats(genomes),
      genomesExecutedRate:
        totalGenomes > 0 ? (totalExecuted / totalGenomes) * 100 : 0,
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

    const { FAST_THRESHOLD_MS, MODERATE_THRESHOLD_MS } = LEARNING_VELOCITY;

    return {
      timeToFirstArtifact: descriptiveStats(ttfa),
      fastLearners: ttfa.filter((t) => t < FAST_THRESHOLD_MS).length,
      moderateLearners: ttfa.filter(
        (t) => t >= FAST_THRESHOLD_MS && t < MODERATE_THRESHOLD_MS,
      ).length,
      slowLearners: ttfa.filter((t) => t >= MODERATE_THRESHOLD_MS).length,
      noArtifact: this.sessions.filter((s) => s.timeToFirstArtifact === null)
        .length,
    };
  }

  /**
   * Calculate tool adoption patterns
   */
  toolAdoption(): ToolAdoption {
    const result = {} as ToolAdoption;
    for (const tool of TOOL_FEATURES) {
      const key = `feature_${tool}` as keyof MetricsSession;
      const usage = this.sessions.map((s) => s[key] as number);
      result[tool] = {
        users: usage.filter((u) => u > 0).length,
        avgUsage: usage.length > 0 ? sum(usage) / usage.length : 0,
      };
    }
    return result;
  }

  /**
   * Calculate render mode preferences
   */
  renderModePreferences(): RenderModePreferences {
    const totals = {
      visual: sum(this.sessions.map((s) => s.renderMode_visual)),
      audio: sum(this.sessions.map((s) => s.renderMode_audio)),
      both: sum(this.sessions.map((s) => s.renderMode_both)),
    };
    const total = totals.visual + totals.audio + totals.both;

    const toStats = (count: number) => ({
      sessions: count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    });

    return {
      visualOnly: toStats(totals.visual),
      audioOnly: toStats(totals.audio),
      multiSensory: toStats(totals.both),
    };
  }

  /**
   * Calculate mutation patterns
   */
  mutationPatterns(): MutationPatterns {
    const result = {} as MutationPatterns;
    let totalMutations = 0;

    for (const type of MUTATION_TYPES) {
      const key = `mutation_${type}` as keyof MetricsSession;
      const values = this.sessions.map((s) => s[key] as number);
      result[type] = descriptiveStats(values);
      totalMutations += sum(values);
    }

    result.totalMutations = totalMutations;
    return result;
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

  /** Metrics to compare between groups */
  private static readonly COMPARISON_METRICS: ReadonlyArray<{
    metric: string;
    extract: (s: MetricsSession) => number | null;
    transform?: (v: number) => number;
  }> = [
    {
      metric: "Session Duration (min)",
      extract: (s) => s.duration,
      transform: (v) => v / MS_PER_MINUTE,
    },
    {
      metric: "Genomes Created",
      extract: (s) => s.genomesCreated,
    },
    {
      metric: "Time to First Artifact (min)",
      extract: (s) => s.timeToFirstArtifact,
      transform: (v) => v / MS_PER_MINUTE,
    },
    {
      metric: "Mutations Applied",
      extract: (s) => s.mutationsApplied,
    },
  ];

  /**
   * Compare two groups (for RCT analysis)
   */
  compareGroups(
    group1Sessions: readonly MetricsSession[],
    group2Sessions: readonly MetricsSession[],
    group1Name: string,
    group2Name: string,
  ): ComparisonResult[] {
    return MetricsAnalyzer.COMPARISON_METRICS.map(
      ({ metric, extract, transform = (v) => v }) => {
        const values1 = group1Sessions
          .map(extract)
          .filter((v): v is number => v !== null)
          .map(transform);
        const values2 = group2Sessions
          .map(extract)
          .filter((v): v is number => v !== null)
          .map(transform);

        if (values1.length === 0 || values2.length === 0) return null;

        return this.createComparison(
          group1Name,
          group2Name,
          metric,
          values1,
          values2,
        );
      },
    ).filter((r): r is ComparisonResult => r !== null);
  }

  private createComparison(
    group1: string,
    group2: string,
    metric: string,
    values1: readonly number[],
    values2: readonly number[],
  ): ComparisonResult {
    const m1 = sum(values1) / values1.length;
    const m2 = sum(values2) / values2.length;
    const { t, p } = tTest(values1, values2);
    const d = cohensD(values1, values2);

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
      interpretation: interpretEffectSize(d),
    };
  }
}
