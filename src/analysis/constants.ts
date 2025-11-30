/**
 * Constants for analysis module
 */

// Time constants
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;

/** Learning velocity thresholds */
export const LEARNING_VELOCITY = {
  FAST_THRESHOLD_MS: 5 * MS_PER_MINUTE,
  MODERATE_THRESHOLD_MS: 15 * MS_PER_MINUTE,
} as const;

/** Tool feature keys as they appear in MetricsSession */
export const TOOL_FEATURES = [
  "diffViewer",
  "timeline",
  "evolution",
  "assessment",
  "export",
] as const;
export type ToolFeature = (typeof TOOL_FEATURES)[number];

/** Mutation types as they appear in MetricsSession */
export const MUTATION_TYPES = [
  "silent",
  "missense",
  "nonsense",
  "frameshift",
  "point",
  "insertion",
  "deletion",
] as const;
export type MutationType = (typeof MUTATION_TYPES)[number];
