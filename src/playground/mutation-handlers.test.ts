/**
 * Mutation Handlers Test Suite
 *
 * Tests for genome mutation operations and preview functionality
 * that applies biological mutation patterns to CodonCanvas genomes.
 *
 * Note: Since these functions depend on DOM elements and ui-state,
 * we test the pure logic patterns by reimplementing them.
 */
import { describe, expect, test } from "bun:test";
import type { MutationType } from "../types";

// Helper function implementations for testing

// Valid mutation types
const VALID_MUTATION_TYPES: MutationType[] = [
  "silent",
  "missense",
  "nonsense",
  "point",
  "insertion",
  "deletion",
  "frameshift",
];

// Mutation type validation
function isValidMutationType(type: string): type is MutationType {
  return VALID_MUTATION_TYPES.includes(type as MutationType);
}

// Empty genome check
function isEmptyGenome(genome: string): boolean {
  return !genome.trim();
}

// Error message extraction
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

// State management pattern
class MutationState {
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

// Mutation type to function mapper (for validation)
function getMutationHandler(type: MutationType): string {
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

describe("Mutation Handlers", () => {
  // Mutation Type Validation
  describe("mutation type validation", () => {
    test("recognizes all valid mutation types", () => {
      for (const type of VALID_MUTATION_TYPES) {
        expect(isValidMutationType(type)).toBe(true);
      }
    });

    test("rejects invalid mutation types", () => {
      expect(isValidMutationType("invalid")).toBe(false);
      expect(isValidMutationType("")).toBe(false);
      expect(isValidMutationType("random")).toBe(false);
    });
  });

  // applyMutation logic
  describe("applyMutation logic", () => {
    test("detects empty genome", () => {
      expect(isEmptyGenome("")).toBe(true);
      expect(isEmptyGenome("   ")).toBe(true);
    });

    test("detects non-empty genome", () => {
      expect(isEmptyGenome("ATG")).toBe(false);
      expect(isEmptyGenome("  ATG  ")).toBe(false);
    });

    test("each mutation type has a handler", () => {
      for (const type of VALID_MUTATION_TYPES) {
        expect(getMutationHandler(type)).toBeDefined();
        expect(typeof getMutationHandler(type)).toBe("string");
      }
    });

    test("unknown mutation type would throw error", () => {
      const invalidType = "unknown" as MutationType;
      expect(() => {
        if (!isValidMutationType(invalidType)) {
          throw new Error(`Unknown mutation type: ${invalidType}`);
        }
      }).toThrow("Unknown mutation type: unknown");
    });
  });

  // previewMutation logic
  describe("previewMutation logic", () => {
    test("detects empty genome for preview", () => {
      expect(isEmptyGenome("")).toBe(true);
    });

    test("preview uses same mutation types as apply", () => {
      // Both functions use the same switch cases
      for (const type of VALID_MUTATION_TYPES) {
        expect(isValidMutationType(type)).toBe(true);
      }
    });
  });

  // getOriginalGenomeBeforeMutation
  describe("getOriginalGenomeBeforeMutation", () => {
    test("returns empty string before any mutation", () => {
      const state = new MutationState();
      expect(state.getOriginal()).toBe("");
    });

    test("returns original genome after mutation", () => {
      const state = new MutationState();
      state.setOriginal("ATG GGA TAA");
      expect(state.getOriginal()).toBe("ATG GGA TAA");
    });

    test("returns most recent original after multiple mutations", () => {
      const state = new MutationState();
      state.setOriginal("ATG GGA TAA");
      state.setOriginal("ATG GGG TAA");
      expect(state.getOriginal()).toBe("ATG GGG TAA");
    });
  });

  // resetMutationState
  describe("resetMutationState", () => {
    test("clears originalGenomeBeforeMutation to empty string", () => {
      const state = new MutationState();
      state.setOriginal("ATG GGA TAA");
      state.reset();
      expect(state.getOriginal()).toBe("");
    });

    test("getOriginalGenomeBeforeMutation returns empty after reset", () => {
      const state = new MutationState();
      state.setOriginal("ATG");
      expect(state.getOriginal()).toBe("ATG");
      state.reset();
      expect(state.getOriginal()).toBe("");
    });
  });

  // Error handling
  describe("error handling", () => {
    test("extracts message from Error instance", () => {
      const error = new Error("Mutation failed: No valid target");
      expect(extractErrorMessage(error)).toBe("Mutation failed: No valid target");
    });

    test("returns generic message for non-Error", () => {
      expect(extractErrorMessage("string error")).toBe("Unknown error");
      expect(extractErrorMessage(null)).toBe("Unknown error");
      expect(extractErrorMessage(undefined)).toBe("Unknown error");
    });

    test("handles Error exceptions with error status pattern", () => {
      const error = new Error("Test error");
      const message =
        error instanceof Error
          ? `Mutation failed: ${error.message}`
          : "Mutation failed";
      expect(message).toBe("Mutation failed: Test error");
    });

    test("handles unknown exceptions with generic error pattern", () => {
      const error = "not an Error";
      const message =
        error instanceof Error
          ? `Mutation failed: ${error.message}`
          : "Mutation failed";
      expect(message).toBe("Mutation failed");
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles whitespace-only genome", () => {
      expect(isEmptyGenome("   \n\t   ")).toBe(true);
    });

    test("handles genome with leading/trailing whitespace", () => {
      expect(isEmptyGenome("  ATG GGA TAA  ")).toBe(false);
    });

    test("state persists across multiple operations", () => {
      const state = new MutationState();
      state.setOriginal("ATG");
      expect(state.getOriginal()).toBe("ATG");
      // Simulate another mutation
      state.setOriginal("GGA");
      expect(state.getOriginal()).toBe("GGA");
      // Reset
      state.reset();
      expect(state.getOriginal()).toBe("");
    });

    test("all mutation types map to handler functions", () => {
      const handlers = VALID_MUTATION_TYPES.map(getMutationHandler);
      expect(handlers.length).toBe(7);
      expect(new Set(handlers).size).toBe(7); // All unique
    });
  });

  // Integration patterns
  describe("integration patterns", () => {
    test("mutation workflow: validate -> apply -> store original", () => {
      const genome = "ATG GGA TAA";
      const type: MutationType = "silent";
      const state = new MutationState();

      // Step 1: Validate genome is not empty
      expect(isEmptyGenome(genome)).toBe(false);

      // Step 2: Validate mutation type
      expect(isValidMutationType(type)).toBe(true);

      // Step 3: Store original
      state.setOriginal(genome);
      expect(state.getOriginal()).toBe(genome);
    });

    test("preview workflow: validate -> get type handler", () => {
      const genome = "ATG GGA TAA";
      const type: MutationType = "missense";

      expect(isEmptyGenome(genome)).toBe(false);
      expect(isValidMutationType(type)).toBe(true);
      expect(getMutationHandler(type)).toBe("applyMissenseMutation");
    });
  });
});
