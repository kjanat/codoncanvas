/**
 * Session data types for metrics collection and analysis
 */

/**
 * Flattened session data for CSV export/import and analysis.
 * Used by MetricsAnalyzer for classroom-level analytics.
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
  errorTypes: string;
}

/**
 * Rich session data for real-time tracking.
 * Used by ResearchMetrics collector for localStorage persistence.
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
  renderModeUsage: { visual: number; audio: number; both: number };
  /** Feature usage tracking */
  features: {
    diffViewer: number;
    timeline: number;
    evolution: number;
    assessment: number;
    export: number;
  };
  /** Time to first successful execution (null if not yet achieved) */
  timeToFirstArtifact: number | null;
  /** Error events */
  errors: Array<{ timestamp: number; type: string; message: string }>;
  /** Mutation type distribution */
  mutationTypes: {
    silent: number;
    missense: number;
    nonsense: number;
    frameshift: number;
    point: number;
    insertion: number;
    deletion: number;
  };
}
