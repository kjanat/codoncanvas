/**
 * Report and metrics aggregate types
 */

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

/**
 * Feature adoption statistics
 */
export interface ToolAdoption {
  diffViewer: { users: number; avgUsage: number };
  timeline: { users: number; avgUsage: number };
  evolution: { users: number; avgUsage: number };
  assessment: { users: number; avgUsage: number };
  export: { users: number; avgUsage: number };
}

/**
 * Render mode usage preferences
 */
export interface RenderModePreferences {
  visualOnly: { sessions: number; percentage: number };
  audioOnly: { sessions: number; percentage: number };
  multiSensory: { sessions: number; percentage: number };
}

/**
 * Mutation type usage patterns
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
 * Complete classroom analytics report
 */
export interface AnalysisReport {
  engagement: EngagementMetrics;
  velocity: LearningVelocity;
  tools: ToolAdoption;
  renderMode: RenderModePreferences;
  mutations: MutationPatterns;
}
