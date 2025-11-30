/**
 * Session data types for metrics collection and analysis
 */

import type {
  FeatureCounts,
  MutationCounts,
  RenderModeCounts,
} from "@/analysis/constants";

/**
 * Flattened session data for CSV export/import and analysis.
 * Used by MetricsAnalyzer for classroom-level analytics.
 *
 * Note: Uses flattened field names (renderMode_visual, mutation_silent, etc.)
 * for CSV compatibility. See ResearchSession for nested structure.
 */
export interface MetricsSession {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  genomesCreated: number;
  genomesExecuted: number;
  timeToFirstArtifact: number | null;
  mutationsApplied: number;
  // Flattened render mode counts
  renderMode_visual: number;
  renderMode_audio: number;
  renderMode_both: number;
  // Flattened mutation counts
  mutation_silent: number;
  mutation_missense: number;
  mutation_nonsense: number;
  mutation_frameshift: number;
  mutation_point: number;
  mutation_insertion: number;
  mutation_deletion: number;
  // Flattened feature counts
  feature_diffViewer: number;
  feature_timeline: number;
  feature_evolution: number;
  feature_assessment: number;
  feature_export: number;
  errorCount: number;
  errorTypes: string;
}

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
