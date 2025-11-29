/**
 * Tests for DiffViewer component logic
 *
 * Tests the genome comparison and diff highlighting functionality.
 * Note: This tests the underlying logic; React rendering tests would require JSDOM.
 */

import { describe, expect, test } from "bun:test";
import { compareGenomes } from "@/genetics/mutations";

describe("DiffViewer logic", () => {
  describe("compareGenomes", () => {
    test("detects no differences for identical genomes", () => {
      const genome = "ATG GGA CCC TAA";
      const result = compareGenomes(genome, genome);

      expect(result.differences).toHaveLength(0);
      expect(result.originalCodons).toEqual(result.mutatedCodons);
    });

    test("detects single codon substitution", () => {
      const original = "ATG GGA CCC TAA";
      const mutated = "ATG GGA AAA TAA";
      const result = compareGenomes(original, mutated);

      expect(result.differences.length).toBeGreaterThan(0);
      const substitution = result.differences.find(
        (d) => d.original === "CCC" && d.mutated === "AAA",
      );
      expect(substitution).toBeDefined();
    });

    test("detects multiple substitutions", () => {
      const original = "ATG GGA CCC TAA";
      const mutated = "ATG AAA TTT TAA";
      const result = compareGenomes(original, mutated);

      expect(result.differences.length).toBe(2);
    });

    test("handles empty genomes", () => {
      const result = compareGenomes("", "");

      expect(result.differences).toHaveLength(0);
      expect(result.originalCodons).toHaveLength(0);
      expect(result.mutatedCodons).toHaveLength(0);
    });

    test("handles different length genomes (insertion)", () => {
      const original = "ATG GGA TAA";
      const mutated = "ATG GGA CCC TAA";
      const result = compareGenomes(original, mutated);

      expect(result.originalCodons.length).toBeLessThan(
        result.mutatedCodons.length,
      );
      expect(result.differences.length).toBeGreaterThan(0);
    });

    test("handles different length genomes (deletion)", () => {
      const original = "ATG GGA CCC TAA";
      const mutated = "ATG GGA TAA";
      const result = compareGenomes(original, mutated);

      expect(result.originalCodons.length).toBeGreaterThan(
        result.mutatedCodons.length,
      );
      expect(result.differences.length).toBeGreaterThan(0);
    });

    test("returns codon arrays", () => {
      const original = "ATG GGA TAA";
      const mutated = "ATG CCC TAA";
      const result = compareGenomes(original, mutated);

      expect(result.originalCodons).toEqual(["ATG", "GGA", "TAA"]);
      expect(result.mutatedCodons).toEqual(["ATG", "CCC", "TAA"]);
    });

    test("difference includes position", () => {
      const original = "ATG GGA TAA";
      const mutated = "ATG CCC TAA";
      const result = compareGenomes(original, mutated);

      expect(result.differences.length).toBe(1);
      expect(result.differences[0].position).toBe(1); // Second codon (0-indexed)
      expect(result.differences[0].original).toBe("GGA");
      expect(result.differences[0].mutated).toBe("CCC");
    });

    test("handles START codon change", () => {
      const original = "ATG GGA TAA";
      const mutated = "GTG GGA TAA"; // Alternative start codon
      const result = compareGenomes(original, mutated);

      expect(result.differences.length).toBe(1);
      expect(result.differences[0].position).toBe(0);
    });

    test("handles STOP codon change", () => {
      const original = "ATG GGA TAA";
      const mutated = "ATG GGA TAG"; // Different stop codon
      const result = compareGenomes(original, mutated);

      expect(result.differences.length).toBe(1);
      expect(result.differences[0].position).toBe(2);
    });
  });

  describe("codon parsing", () => {
    test("splits by whitespace", () => {
      const result = compareGenomes("ATG  GGA   TAA", "ATG GGA TAA");

      // Should normalize whitespace in codons array
      expect(result.originalCodons.filter((c) => c.length > 0).length).toBe(3);
    });

    test("handles lowercase codons", () => {
      const original = "atg gga taa";
      const mutated = "ATG GGA TAA";
      const result = compareGenomes(original, mutated);

      // Depending on implementation, may or may not detect differences
      // At minimum, should not throw
      expect(result.originalCodons.length).toBe(3);
    });

    test("handles mixed case", () => {
      const original = "AtG gGa TaA";
      const mutated = "ATG GGA TAA";
      const result = compareGenomes(original, mutated);

      expect(result.originalCodons.length).toBe(3);
      expect(result.mutatedCodons.length).toBe(3);
    });
  });

  describe("edge cases", () => {
    test("single codon genome", () => {
      const result = compareGenomes("ATG", "ATG");

      expect(result.differences).toHaveLength(0);
      expect(result.originalCodons).toEqual(["ATG"]);
    });

    test("completely different genomes", () => {
      const original = "ATG GGA TAA";
      const mutated = "GTG CCC TAG";
      const result = compareGenomes(original, mutated);

      expect(result.differences.length).toBe(3);
    });

    test("whitespace-only genome", () => {
      const result = compareGenomes("   ", "   ");

      // Should handle gracefully
      expect(result.originalCodons.filter((c) => c.length > 0)).toHaveLength(0);
    });

    test("genome with newlines", () => {
      const original = "ATG\nGGA\nTAA";
      const mutated = "ATG GGA TAA";
      const result = compareGenomes(original, mutated);

      // Should split on any whitespace
      expect(result.originalCodons.filter((c) => c.length > 0).length).toBe(3);
    });
  });
});
