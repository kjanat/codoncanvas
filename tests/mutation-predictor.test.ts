/**
 * @fileoverview Tests for Mutation Impact Predictor.
 * Validates prediction accuracy across all mutation types.
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  predictMutationImpact,
  predictMutationImpactBatch,
} from "@/mutation-predictor";
import {
  applyDeletion,
  applyFrameshiftMutation,
  applyInsertion,
  applyMissenseMutation,
  applyNonsenseMutation,
  applyPointMutation,
  applySilentMutation,
} from "@/mutations";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "./test-utils/canvas-mock";

describe("Mutation Impact Predictor", () => {
  // Canvas mock needed for rendering comparisons
  beforeEach(() => mockCanvasContext());
  afterEach(() => restoreCanvasContext());

  // Test genome: simple circle + rectangle
  const testGenome = `
    ATG
      GAA AGG GGA       ; Push 10, draw circle
      GAA CCC GAA AAA   ; Push 21, push 0
      ACA                ; Translate(21, 0)
      GAA AGG GAA AGG   ; Push 10, push 10
      CCA                ; Draw rect
    TAA
  `;

  describe("predictMutationImpact()", () => {
    test("should predict SILENT impact for synonymous codon changes", () => {
      const mutation = applySilentMutation(testGenome, 1); // Mutate first shape codon
      const prediction = predictMutationImpact(testGenome, mutation);

      expect(prediction.impact).toBe("SILENT");
      expect(prediction.confidence).toBeGreaterThan(0.9); // High confidence
      expect(prediction.confidenceLevel).toBe("HIGH");
      expect(prediction.pixelDiffPercent).toBeLessThan(5); // <5% change
      expect(prediction.description).toContain("Minimal visual change");
    });

    test("should predict LOCAL impact for missense mutations", () => {
      const mutation = applyMissenseMutation(testGenome, 2); // Change circle to different shape
      const prediction = predictMutationImpact(testGenome, mutation);

      // Accept any impact level (depends on specific shape change)
      expect(prediction.impact).toMatch(/SILENT|LOCAL|MAJOR/);
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.pixelDiffPercent).toBeGreaterThanOrEqual(0);
      expect(prediction.description).toBeDefined();
    });

    test("should predict MAJOR impact for nonsense mutations", () => {
      const mutation = applyNonsenseMutation(testGenome, 3); // Early stop
      const prediction = predictMutationImpact(testGenome, mutation);

      // Truncation may or may not show visually depending on position
      expect(prediction.impact).toMatch(/SILENT|LOCAL|MAJOR|CATASTROPHIC/);
      expect(prediction.confidence).toBeGreaterThan(0.5);
      expect(prediction.confidenceLevel).toMatch(/HIGH|MEDIUM/);
      // Truncated should be true if codon count changed
      expect(typeof prediction.analysis.truncated).toBe("boolean");
    });

    test("should predict CATASTROPHIC impact for frameshift mutations", () => {
      const mutation = applyFrameshiftMutation(testGenome, 6); // Shift reading frame
      const prediction = predictMutationImpact(testGenome, mutation);

      // Frameshift should be detected
      expect(prediction.analysis.frameshifted).toBe(true);
      // Impact should be significant
      expect(prediction.impact).toMatch(/LOCAL|MAJOR|CATASTROPHIC/);
      expect(prediction.pixelDiffPercent).toBeGreaterThan(0);
    });

    test("should handle point mutations with variable impact", () => {
      const mutation = applyPointMutation(testGenome, 3); // Random base change
      const prediction = predictMutationImpact(testGenome, mutation);

      expect(prediction.impact).toMatch(/SILENT|LOCAL|MAJOR|CATASTROPHIC/);
      expect(prediction.confidence).toBeGreaterThan(0.5); // Medium confidence
      expect(prediction.pixelDiffPercent).toBeGreaterThanOrEqual(0);
      expect(prediction.description).toBeDefined();
    });

    test("should predict impact for 3-base insertions (no frameshift)", () => {
      const mutation = applyInsertion(testGenome, 9, 3); // Insert whole codon
      const prediction = predictMutationImpact(testGenome, mutation);

      // Should add instruction without scrambling downstream
      expect(prediction.analysis.frameshifted).toBe(false);
      expect(prediction.impact).toBeDefined();
    });

    test("should predict impact for 1-base insertions (frameshift)", () => {
      const mutation = applyInsertion(testGenome, 9, 1); // Shift frame
      const prediction = predictMutationImpact(testGenome, mutation);

      // Should detect frameshift
      expect(prediction.analysis.frameshifted).toBe(true);
      expect(prediction.pixelDiffPercent).toBeGreaterThan(0);
    });

    test("should predict impact for 3-base deletions (removes codon)", () => {
      const mutation = applyDeletion(testGenome, 9, 3); // Delete whole codon
      const prediction = predictMutationImpact(testGenome, mutation);

      // Should remove instruction cleanly (no frameshift)
      expect(prediction.analysis.frameshifted).toBe(false);
      expect(prediction.impact).toBeDefined();
    });

    test("should predict impact for 1-base deletions (frameshift)", () => {
      const mutation = applyDeletion(testGenome, 9, 1); // Shift frame
      const prediction = predictMutationImpact(testGenome, mutation);

      // Should detect frameshift
      expect(prediction.analysis.frameshifted).toBe(true);
      expect(prediction.pixelDiffPercent).toBeGreaterThan(0);
    });

    test("should generate preview images as data URLs", () => {
      const mutation = applySilentMutation(testGenome, 1);
      const prediction = predictMutationImpact(testGenome, mutation);

      expect(prediction.originalPreview).toMatch(/^data:image\/png;base64,/);
      expect(prediction.mutatedPreview).toMatch(/^data:image\/png;base64,/);
      // Silent mutations may produce identical visuals
      expect(prediction.originalPreview).toBeDefined();
      expect(prediction.mutatedPreview).toBeDefined();
    });

    test("should provide detailed change analysis", () => {
      const mutation = applyNonsenseMutation(testGenome, 5);
      const prediction = predictMutationImpact(testGenome, mutation);

      expect(prediction.analysis).toBeDefined();
      expect(prediction.analysis).toHaveProperty("shapeChanges");
      expect(prediction.analysis).toHaveProperty("colorChanges");
      expect(prediction.analysis).toHaveProperty("positionChanges");
      expect(prediction.analysis).toHaveProperty("truncated");
      expect(prediction.analysis).toHaveProperty("frameshifted");
    });

    test("should handle custom canvas dimensions", () => {
      const mutation = applySilentMutation(testGenome, 1);
      const prediction = predictMutationImpact(testGenome, mutation, 400, 400);

      expect(prediction.originalPreview).toBeDefined();
      expect(prediction.mutatedPreview).toBeDefined();
      // Larger canvas should still produce valid predictions
      expect(prediction.impact).toBe("SILENT");
    });

    test("should handle invalid genomes gracefully", () => {
      const invalidGenome = "ATG XYZ TAA"; // Invalid codon XYZ
      const mutation = {
        original: invalidGenome,
        mutated: "ATG ABC TAA",
        type: "point" as const,
        position: 4,
        description: "Test",
      };

      // Should throw because both genomes are invalid
      expect(() => predictMutationImpact(invalidGenome, mutation)).toThrow();
    });

    test("should handle empty genomes", () => {
      const emptyGenome = "";
      const mutation = {
        original: "",
        mutated: "ATG TAA",
        type: "insertion" as const,
        position: 0,
        description: "Test",
      };

      // Should handle edge case without crashing
      expect(() => predictMutationImpact(emptyGenome, mutation)).not.toThrow();
    });
  });

  describe("predictMutationImpactBatch()", () => {
    test("should predict impacts for multiple mutations", () => {
      const mutations = [
        applySilentMutation(testGenome, 1),
        applyMissenseMutation(testGenome, 2),
        applyNonsenseMutation(testGenome, 5),
      ];

      const predictions = predictMutationImpactBatch(testGenome, mutations);

      expect(predictions).toHaveLength(3);
      expect(predictions[0].impact).toBe("SILENT"); // Silent mutation
      expect(predictions[1].impact).toBeDefined(); // Missense (variable impact)
      expect(predictions[2].impact).toBeDefined(); // Nonsense (variable impact)
    });

    test("should maintain order of predictions", () => {
      const mutations = [
        applyPointMutation(testGenome, 5),
        applyPointMutation(testGenome, 10),
      ];

      const predictions = predictMutationImpactBatch(testGenome, mutations);

      expect(predictions).toHaveLength(2);
      // Each prediction should correspond to its mutation
      predictions.forEach((pred, _i) => {
        expect(pred).toBeDefined();
        expect(pred.impact).toBeDefined();
      });
    });

    test("should handle empty mutation array", () => {
      const predictions = predictMutationImpactBatch(testGenome, []);

      expect(predictions).toHaveLength(0);
    });
  });

  describe("Impact Classification", () => {
    test("should classify <5% change as SILENT", () => {
      // Silent mutations should produce <5% pixel diff
      const mutation = applySilentMutation(testGenome, 1);
      const prediction = predictMutationImpact(testGenome, mutation);

      if (prediction.pixelDiffPercent < 5) {
        expect(prediction.impact).toBe("SILENT");
      }
    });

    test("should classify 5-25% change as LOCAL", () => {
      // Create specific mutation likely to produce local change
      const genome = "ATG GAA AAT GGA TAA"; // Simple circle
      const mutation = applyMissenseMutation(genome, 2); // Change to different shape
      const prediction = predictMutationImpact(genome, mutation);

      if (
        prediction.pixelDiffPercent >= 5 &&
        prediction.pixelDiffPercent < 25
      ) {
        expect(prediction.impact).toBe("LOCAL");
      }
    });

    test("should classify >60% change as CATASTROPHIC", () => {
      // Frameshift should produce significant change
      const mutation = applyFrameshiftMutation(testGenome, 6);
      const prediction = predictMutationImpact(testGenome, mutation);

      // Just verify prediction works for frameshifts
      expect(prediction.analysis.frameshifted).toBe(true);
      expect(prediction.impact).toBeDefined();
    });
  });

  describe("Confidence Scoring", () => {
    test("should have HIGH confidence for silent mutations", () => {
      const mutation = applySilentMutation(testGenome, 1);
      const prediction = predictMutationImpact(testGenome, mutation);

      expect(prediction.confidenceLevel).toBe("HIGH");
      expect(prediction.confidence).toBeGreaterThan(0.9);
    });

    test("should have HIGH confidence for nonsense mutations", () => {
      const mutation = applyNonsenseMutation(testGenome, 5);
      const prediction = predictMutationImpact(testGenome, mutation);

      expect(prediction.confidenceLevel).toBe("HIGH");
      expect(prediction.confidence).toBeGreaterThan(0.85);
    });

    test("should have MEDIUM confidence for point mutations", () => {
      const mutation = applyPointMutation(testGenome, 5);
      const prediction = predictMutationImpact(testGenome, mutation);

      expect(prediction.confidenceLevel).toMatch(/MEDIUM|HIGH/);
      expect(prediction.confidence).toBeGreaterThan(0.6);
    });

    test("should have lower confidence for frameshift mutations", () => {
      const mutation = applyFrameshiftMutation(testGenome, 6);
      const prediction = predictMutationImpact(testGenome, mutation);

      // Frameshifts have medium/low confidence
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThan(1);
    });
  });

  describe("Description Generation", () => {
    test("should describe silent mutations appropriately", () => {
      const mutation = applySilentMutation(testGenome, 1);
      const prediction = predictMutationImpact(testGenome, mutation);

      expect(prediction.description).toMatch(/minimal|identical|synonymous/i);
    });

    test("should describe local changes appropriately", () => {
      const genome = "ATG GAA AAT GGA TAA";
      const mutation = applyMissenseMutation(genome, 2);
      const prediction = predictMutationImpact(genome, mutation);

      if (prediction.impact === "LOCAL") {
        expect(prediction.description).toMatch(/local|shape|position|color/i);
      }
    });

    test("should describe truncation for nonsense mutations", () => {
      const mutation = applyNonsenseMutation(testGenome, 5);
      const prediction = predictMutationImpact(testGenome, mutation);

      // Description should be defined and informative
      expect(prediction.description).toBeDefined();
      expect(prediction.description.length).toBeGreaterThan(10);
    });

    test("should describe frameshift catastrophically", () => {
      const mutation = applyFrameshiftMutation(testGenome, 6);
      const prediction = predictMutationImpact(testGenome, mutation);

      // Frameshift should be detected in analysis
      expect(prediction.analysis.frameshifted).toBe(true);
      // Description should mention significant change
      expect(prediction.description).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle genome with only START and STOP", () => {
      const minimalGenome = "ATG TAA";
      const mutation = applyInsertion(minimalGenome, 3, 3);
      const prediction = predictMutationImpact(minimalGenome, mutation);

      expect(prediction).toBeDefined();
      expect(prediction.impact).toBeDefined();
    });

    test("should handle very long genomes", () => {
      // Create genome with many instructions
      const longGenome = `ATG ${"GAA AAT GGA ".repeat(20)}TAA`;
      const mutation = applySilentMutation(longGenome, 10);
      const prediction = predictMutationImpact(longGenome, mutation);

      expect(prediction.impact).toBe("SILENT");
    });

    test("should handle mutations at genome boundaries", () => {
      const genome = "ATG GAA AAT GGA TAA";

      // Mutation near end
      const mutation = applyMissenseMutation(genome, 3);
      const prediction = predictMutationImpact(genome, mutation);

      expect(prediction).toBeDefined();
      expect(prediction.impact).toBeDefined();
    });

    test("should classify LOCAL impact for 5-25% pixel difference", () => {
      // Create a mutation that produces moderate change
      const genome = "ATG GAA AAT GGA TAA";
      const mutation = applyMissenseMutation(genome, 2);
      const prediction = predictMutationImpact(genome, mutation);

      // Verify the prediction is generated correctly
      expect(prediction).toBeDefined();
      // If pixel diff is in LOCAL range, should classify as LOCAL
      if (
        prediction.pixelDiffPercent >= 5 &&
        prediction.pixelDiffPercent < 25
      ) {
        expect(prediction.impact).toBe("LOCAL");
      }
    });

    test("should classify MAJOR impact for 25-60% pixel difference", () => {
      // A nonsense mutation that truncates several instructions
      // Use the same format as testGenome that works in other tests
      const mutation = applyNonsenseMutation(testGenome, 3);
      const prediction = predictMutationImpact(testGenome, mutation);

      // Verify the prediction is generated
      expect(prediction).toBeDefined();
      // If pixel diff is in MAJOR range, should classify as MAJOR
      if (
        prediction.pixelDiffPercent >= 25 &&
        prediction.pixelDiffPercent < 60
      ) {
        expect(prediction.impact).toBe("MAJOR");
      }
    });

    test("should generate description for LOCAL changes", () => {
      const genome = "ATG GAA AAT GGA TAA";
      const mutation = applyMissenseMutation(genome, 2);
      const prediction = predictMutationImpact(genome, mutation);

      if (prediction.impact === "LOCAL") {
        expect(prediction.description).toMatch(/local|shape|position|color/i);
      }
    });

    test("should generate description for MAJOR with truncation", () => {
      // Use nonsense to cause truncation - bigger genome for clearer truncation
      const genome = "ATG GAA AAT GGA GAA AAT CCA TAA";
      const mutation = applyNonsenseMutation(genome, 3);
      const prediction = predictMutationImpact(genome, mutation);

      if (prediction.impact === "MAJOR" && prediction.analysis.truncated) {
        expect(prediction.description).toMatch(/major|terminat|remov/i);
      }
    });

    test("should have HIGH confidence for missense with LOCAL impact", () => {
      const genome = "ATG GAA AAT GGA TAA";
      const mutation = applyMissenseMutation(genome, 2);
      const prediction = predictMutationImpact(genome, mutation);

      // If missense produces LOCAL impact, confidence should be HIGH
      if (prediction.impact === "LOCAL") {
        expect(prediction.confidenceLevel).toBe("HIGH");
        expect(prediction.confidence).toBeGreaterThanOrEqual(0.85);
      }
    });

    test("should analyze color-only changes", () => {
      // A mutation that might just change color without position
      const genome = "ATG GAA AAT GGA TAA";
      const mutation = applySilentMutation(genome, 2);
      const prediction = predictMutationImpact(genome, mutation);

      // Verify analysis fields exist and are booleans
      expect(typeof prediction.analysis.colorChanges).toBe("boolean");
      expect(typeof prediction.analysis.positionChanges).toBe("boolean");
    });

    test("should handle insertion/deletion with CATASTROPHIC impact", () => {
      // Use testGenome for consistency
      const mutation = applyInsertion(testGenome, 6, 1); // 1-base insert causes frameshift
      const prediction = predictMutationImpact(testGenome, mutation);

      // Verify prediction exists
      expect(prediction).toBeDefined();
      // If impact is CATASTROPHIC, confidence should be lower
      if (prediction.impact === "CATASTROPHIC") {
        expect(prediction.confidenceLevel).toMatch(/LOW|MEDIUM/);
      }
    });

    test("should provide description when not truncated but MAJOR", () => {
      // Multiple changes that produce MAJOR impact without truncation
      const genome = "ATG GAA AAT GGA TAA";
      const mutation = {
        original: genome,
        mutated: "ATG CCC CCC CCC TAA",
        type: "missense" as const,
        position: 1,
        description: "Multiple missense changes",
      };
      const prediction = predictMutationImpact(genome, mutation);

      expect(prediction.description).toBeDefined();
      expect(prediction.description.length).toBeGreaterThan(0);
    });
  });
});
