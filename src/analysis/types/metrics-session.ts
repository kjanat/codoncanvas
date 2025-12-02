/**
 * Session data types for metrics collection and analysis
 */

import type {
  FeatureCounts,
  MutationCounts,
  RenderModeCounts,
} from "@/analysis/constants";

/** Error event stored in session */
export interface SessionError {
  timestamp: number;
  type: string;
  message: string;
}

/**
 * Rich session data for real-time tracking.
 * Used by ResearchMetrics collector for localStorage persistence.
 *
 * Note: Uses nested objects for cleaner runtime API.
 * See MetricsSession for flattened CSV-compatible structure.
 */
export interface ResearchSession {
  /** Unique session ID (UUID) */
  sessionId: string;
  /** Timestamp when session started */
  startTime: number;
  /** Timestamp when session ended (null if ongoing) */
  endTime: number | null;
  /** Duration in milliseconds (null if ongoing) */
  duration: number | null;
  /** Total genomes created during session */
  genomesCreated: number;
  /** Total genomes executed during session */
  genomesExecuted: number;
  /** Total mutations applied during session */
  mutationsApplied: number;
  /** Render mode usage counts */
  renderModeUsage: RenderModeCounts;
  /** Feature usage tracking */
  features: FeatureCounts;
  /** Time to first successful execution (null if not yet achieved) */
  timeToFirstArtifact: number | null;
  /** Error events */
  errors: SessionError[];
  /** Mutation type distribution */
  mutationTypes: MutationCounts;
}

/**
 * Aggregate statistics across multiple sessions.
 * Returned by ResearchMetrics.getAggregateStats()
 */
export interface AggregateStats {
  totalSessions: number;
  totalDuration: number;
  avgDuration: number;
  totalGenomesCreated: number;
  totalGenomesExecuted: number;
  totalMutations: number;
  avgTimeToFirstArtifact: number;
  mutationTypeDistribution: MutationCounts;
  renderModePreferences: RenderModeCounts;
  featureUsage: FeatureCounts;
  totalErrors: number;
}
