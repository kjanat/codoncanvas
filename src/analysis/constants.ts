/**
 * Constants for analysis module
 */

// Import domain types from genetics (single source of truth)
import type { MutationType, RenderMode } from "@/types/genetics";
import { RENDER_MODES } from "@/types/genetics";

// Re-export for analysis module consumers
export type { MutationType, RenderMode };
export { RENDER_MODES };

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

/** Mutation types array for iteration (type from genetics.ts) */
export const MUTATION_TYPES: readonly MutationType[] = [
  "silent",
  "missense",
  "nonsense",
  "frameshift",
  "point",
  "insertion",
  "deletion",
] as const;

// ============================================================================
// Shared count types - used by both MetricsSession and ResearchSession
// ============================================================================

/** Mutation type counts (e.g., { silent: 5, missense: 2, ... }) */
export type MutationCounts = Record<MutationType, number>;

/** Feature usage counts (e.g., { diffViewer: 3, timeline: 1, ... }) */
export type FeatureCounts = Record<ToolFeature, number>;

/** Render mode usage counts */
export type RenderModeCounts = Record<RenderMode, number>;

/** Factory to create zero-initialized mutation counts */
export function createMutationCounts(): MutationCounts {
  return {
    silent: 0,
    missense: 0,
    nonsense: 0,
    frameshift: 0,
    point: 0,
    insertion: 0,
    deletion: 0,
  };
}

/** Factory to create zero-initialized feature counts */
export function createFeatureCounts(): FeatureCounts {
  return {
    diffViewer: 0,
    timeline: 0,
    evolution: 0,
    assessment: 0,
    export: 0,
  };
}

/** Factory to create zero-initialized render mode counts */
export function createRenderModeCounts(): RenderModeCounts {
  return {
    visual: 0,
    audio: 0,
    both: 0,
  };
}
