/**
 * Report and metrics aggregate types
 */

import type { MutationType, ToolFeature } from "@/analysis/constants";
import type { DescriptiveStats } from "./statistics";

/**
 * Classroom-level engagement metrics
 */
export interface EngagementMetrics {
  totalSessions: number;
  uniqueUsers: number;
  avgSessionDuration: DescriptiveStats;
  totalGenomesCreated: number;
  avgGenomesPerSession: DescriptiveStats;
  genomesExecutedRate: number;
  retentionRate: number;
}

/**
 * Learning velocity analysis (time to first successful creation)
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

/** Usage stats for a single tool feature */
export interface ToolUsageStats {
  users: number;
  avgUsage: number;
}

/**
 * Feature adoption statistics (derived from ToolFeature)
 */
export type ToolAdoption = Record<ToolFeature, ToolUsageStats>;

/** Session count with percentage */
export interface SessionStats {
  sessions: number;
  percentage: number;
}

/**
 * Render mode usage preferences
 */
export interface RenderModePreferences {
  visualOnly: SessionStats;
  audioOnly: SessionStats;
  multiSensory: SessionStats;
}

/**
 * Mutation type usage patterns (derived from MutationType)
 */
export type MutationPatterns = Record<MutationType, DescriptiveStats> & {
  totalMutations: number;
};

/**
 * Complete classroom analytics report
 */
export interface AnalysisReport {
  engagement: EngagementMetrics;
  velocity: LearningVelocity;
  tools: ToolAdoption;
  renderMode: RenderModePreferences;
  mutations: MutationPatterns;
}
