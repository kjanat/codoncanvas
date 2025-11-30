/**
 * Event types for research metrics tracking
 */

import type {
  MutationType,
  RenderMode,
  ToolFeature,
} from "@/analysis/constants";

export type { MutationType, RenderMode, ToolFeature };

/**
 * Mutation event for tracking genome modifications
 */
export interface MutationEvent {
  timestamp: number;
  type: MutationType;
  genomeLengthBefore: number;
  genomeLengthAfter: number;
}

/**
 * Genome execution event for tracking user interactions
 */
export interface ExecutionEvent {
  /** Unix timestamp of execution */
  timestamp: number;
  /** Render mode: visual drawing, audio synthesis, or both */
  renderMode: RenderMode;
  /** Length of executed genome (codon count) */
  genomeLength: number;
  /** Number of VM instructions executed */
  instructionCount: number;
  /** Whether execution succeeded */
  success: boolean;
  /** Error message if execution failed */
  errorMessage?: string;
}

/**
 * Feature usage event for tracking feature adoption
 */
export interface FeatureEvent {
  /** Unix timestamp of feature interaction */
  timestamp: number;
  /** Which feature was used */
  feature: ToolFeature;
  /** Action performed: opening, closing, or interacting */
  action: "open" | "close" | "interact";
}
