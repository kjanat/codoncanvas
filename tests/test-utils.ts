/**
 * Shared Test Utilities
 *
 * Common helper functions and factories used across test files
 * to reduce duplication and ensure consistent test patterns.
 */

import { MUTATION_TYPES } from "@/genetics/mutations";
import {
  type MutationType,
  RENDER_MODES,
  type RenderMode,
  type VMState,
} from "@/types";

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Valid mutation types for CodonCanvas.
 * Re-exported from @/genetics/mutations for test convenience.
 */
export const VALID_MUTATION_TYPES = MUTATION_TYPES;

/**
 * Check if a string is a valid mutation type
 */
export function isValidMutationType(type: string): type is MutationType {
  return MUTATION_TYPES.includes(type as MutationType);
}

/**
 * Check if a genome string is empty (whitespace only)
 */
export function isEmptyGenome(genome: string): boolean {
  return !genome.trim();
}

/**
 * Extract error message from unknown error value
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

// ============================================================================
// VMState Factories
// ============================================================================

/**
 * Create a default VMState object with optional overrides
 */
export function createVMState(overrides: Partial<VMState> = {}): VMState {
  return {
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    color: { h: 0, s: 0, l: 0 },
    stack: [],
    instructionPointer: 0,
    stateStack: [],
    instructionCount: 0,
    seed: 12345,
    ...overrides,
  };
}

/**
 * Create a VMState with position, rotation, and color set
 */
export function createVMStateWithPosition(
  x: number,
  y: number,
  rotation: number = 0,
  color: { h: number; s: number; l: number } = { h: 0, s: 0, l: 0 },
): VMState {
  return createVMState({
    position: { x, y },
    rotation,
    color,
  });
}

/**
 * Create multiple VMStates for timeline/snapshot testing
 */
export function createVMStateSequence(count: number): VMState[] {
  return Array.from({ length: count }, (_, i) =>
    createVMState({
      position: { x: i * 100, y: i * 100 },
      rotation: i * 45,
      color: { h: (i * 60) % 360, s: 50, l: 50 },
      instructionPointer: i,
      instructionCount: i,
    }),
  );
}

// ============================================================================
// State Management Helpers
// ============================================================================

/**
 * Generic state management class for testing state patterns
 */
export class TestState<T> {
  private value: T;

  constructor(initial: T) {
    this.value = initial;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    this.value = newValue;
  }

  reset(initial: T): void {
    this.value = initial;
  }
}

/**
 * Mutation state management for testing mutation handlers
 */
export class MutationState {
  private originalGenome = "";

  setOriginal(genome: string): void {
    this.originalGenome = genome;
  }

  getOriginal(): string {
    return this.originalGenome;
  }

  reset(): void {
    this.originalGenome = "";
  }
}

// ============================================================================
// DOM Mocking Utilities
// ============================================================================

/**
 * Mock URL.createObjectURL and URL.revokeObjectURL
 * Returns cleanup function and captured data
 */
export function mockURLObjectAPI(): {
  createdUrls: string[];
  createdBlobs: Blob[];
  revokedUrls: string[];
  cleanup: () => void;
} {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  const createdUrls: string[] = [];
  const createdBlobs: Blob[] = [];
  const revokedUrls: string[] = [];

  let urlCounter = 0;

  URL.createObjectURL = (blob: Blob): string => {
    const url = `blob:mock-url-${urlCounter++}`;
    createdUrls.push(url);
    createdBlobs.push(blob);
    return url;
  };

  URL.revokeObjectURL = (url: string): void => {
    revokedUrls.push(url);
  };

  return {
    createdUrls,
    createdBlobs,
    revokedUrls,
    cleanup: () => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    },
  };
}

/**
 * Mock document.body.appendChild to track appended elements
 * Returns cleanup function and captured data
 */
export function mockAppendChild(): {
  appendedElements: HTMLElement[];
  cleanup: () => void;
} {
  const originalAppendChild = document.body.appendChild.bind(document.body);
  const appendedElements: HTMLElement[] = [];

  document.body.appendChild = <T extends Node>(node: T): T => {
    if (node instanceof HTMLElement) {
      appendedElements.push(node);
    }
    return originalAppendChild(node);
  };

  return {
    appendedElements,
    cleanup: () => {
      document.body.appendChild = originalAppendChild;
    },
  };
}

/**
 * Track click events on elements
 */
export function trackClicks(elements: HTMLElement[]): {
  clickedElements: HTMLElement[];
} {
  const clickedElements: HTMLElement[] = [];

  for (const el of elements) {
    const originalClick = el.click.bind(el);
    el.click = () => {
      clickedElements.push(el);
      originalClick();
    };
  }

  return { clickedElements };
}

// ============================================================================
// Filename Generation Helpers
// ============================================================================

/**
 * Generate a genome filename with current date
 */
export function generateGenomeFilename(): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `codoncanvas-${timestamp}`;
}

/**
 * Generate a MIDI filename with timestamp
 */
export function generateMidiFilename(): string {
  return `codoncanvas-${Date.now()}.mid`;
}

/**
 * Generate a progress filename with timestamp
 */
export function generateProgressFilename(): string {
  return `codoncanvas-progress-${Date.now()}.json`;
}

/**
 * Extract title from genome string (first line, max 30 chars)
 */
export function extractTitle(genome: string): string {
  const firstLine = genome.split("\n")[0].replace(/;.*$/, "").trim();
  return firstLine.slice(0, 30) || "CodonCanvas Genome";
}

// ============================================================================
// Render Mode Helpers
// ============================================================================

/**
 * Valid render modes for CodonCanvas.
 * Re-exported from @/types for test convenience.
 */
export const VALID_RENDER_MODES = RENDER_MODES;

/**
 * Check if a string is a valid render mode
 */
export function isValidRenderMode(mode: string): mode is RenderMode {
  return RENDER_MODES.includes(mode as RenderMode);
}

// ============================================================================
// Achievement Data Helpers
// ============================================================================

/**
 * Create achievement data structure for testing
 */
export function createAchievementData(achievements: unknown[] = []): {
  achievements: unknown[];
  timestamp: string;
  userAgent: string;
} {
  return {
    achievements,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "test-agent",
  };
}

// ============================================================================
// Mutation Handler Helpers
// ============================================================================

/**
 * Get mutation handler function name for a mutation type
 */
export function getMutationHandler(type: MutationType): string {
  const handlers: Record<MutationType, string> = {
    silent: "applySilentMutation",
    missense: "applyMissenseMutation",
    nonsense: "applyNonsenseMutation",
    point: "applyPointMutation",
    insertion: "applyInsertion",
    deletion: "applyDeletion",
    frameshift: "applyFrameshiftMutation",
  };
  return handlers[type];
}
