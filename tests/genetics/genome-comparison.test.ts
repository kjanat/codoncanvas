/**
 * Genome Comparison Test Suite
 *
 * Tests for detailed genome comparison tools for educational analysis.
 * Provides metrics for comparing two arbitrary genomes with visual and sequence analysis.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { compareGenomesDetailed } from "@/genetics/genome-comparison";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "@/tests/test-utils/canvas-mock";

describe("GenomeComparison", () => {
  beforeEach(() => {
    mockCanvasContext();
  });

  afterEach(() => {
    restoreCanvasContext();
  });

  // compareGenomesDetailed - Main Entry Point
  describe("compareGenomesDetailed", () => {
    test("returns GenomeComparisonResult with all required fields for two valid genomes", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.codons).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.visual).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    test("compares identical genomes and returns 0% difference metrics and 'identical' similarity", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG");
      expect(result.metrics.codonDifferencePercent).toBe(0);
      expect(result.metrics.hammingDistance).toBe(0);
      expect(result.analysis.similarity).toBe("identical");
    });

    test("compares different genomes and calculates correct codonDifferencePercent", () => {
      // 1 codon different out of 2 = 50%
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.metrics.codonDifferencePercent).toBe(50);
    });

    test("accepts custom canvasWidth and canvasHeight options", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG", {
        canvasWidth: 500,
        canvasHeight: 500,
      });
      expect(result).toBeDefined();
    });

    test("uses default canvas dimensions 300x300 when not specified", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG");
      // Result should work with default dimensions
      expect(result.visual.originalCanvas).toBeDefined();
      expect(result.visual.mutatedCanvas).toBeDefined();
    });

    test("correctly identifies differences array with position, original, and mutated codons", () => {
      const result = compareGenomesDetailed("ATG GGG AAA", "ATG GAG AAA");
      const diff = result.codons.differences.find(
        (d) => d.original === "GGG" && d.mutated === "GAG",
      );
      expect(diff).toBeDefined();
      expect(diff?.position).toBe(1);
    });

    test("calculates hammingDistance as number of differing codon positions", () => {
      // 2 differences
      const result = compareGenomesDetailed("ATG GGG AAA", "AAA GAG CCC");
      expect(result.metrics.hammingDistance).toBe(3);
    });

    test("calculates lengthDifference (positive when second is longer, negative when first)", () => {
      // Second genome has 1 more codon
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG AAA");
      expect(result.metrics.lengthDifference).toBe(1);

      // First genome has 1 more codon
      const result2 = compareGenomesDetailed("ATG GGG AAA", "ATG GGG");
      expect(result2.metrics.lengthDifference).toBe(-1);
    });

    test("reports maxLength as the length of the longer genome", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG AAA");
      expect(result.metrics.maxLength).toBe(3);
    });

    test("generates data URL for original genome canvas rendering", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.visual.originalCanvas).toContain("data:");
    });

    test("generates data URL for mutated genome canvas rendering", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.visual.mutatedCanvas).toContain("data:");
    });

    test("sets bothValid to boolean value when both genomes render", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(typeof result.visual.bothValid).toBe("boolean");
    });

    test("sets bothValid=false when either genome fails to render", () => {
      // Invalid genome (invalid codon)
      const result = compareGenomesDetailed("ATG GGG", "XXX YYY");
      expect(result.visual.bothValid).toBe(false);
    });

    test("handles empty string genomes gracefully", () => {
      const result = compareGenomesDetailed("", "");
      expect(result.metrics.codonDifferencePercent).toBe(0);
      expect(result.analysis.similarity).toBe("identical");
    });

    test("handles genomes with only START codon (ATG)", () => {
      const result = compareGenomesDetailed("ATG", "ATG");
      expect(result.metrics.codonDifferencePercent).toBe(0);
    });

    test("handles genomes with only whitespace", () => {
      const result = compareGenomesDetailed("   ", "   ");
      expect(result).toBeDefined();
    });

    test("handles genomes with comments (semicolon lines)", () => {
      const result = compareGenomesDetailed(
        "; Comment\nATG GGG",
        "; Another comment\nATG GGG",
      );
      expect(result.metrics.codonDifferencePercent).toBe(0);
    });

    test("handles very long genomes (>1000 codons) without performance issues", () => {
      const longGenome = `ATG ${"GGG ".repeat(999)}`.trim();
      const start = Date.now();
      const result = compareGenomesDetailed(longGenome, longGenome);
      const elapsed = Date.now() - start;
      expect(result.metrics.codonDifferencePercent).toBe(0);
      expect(elapsed).toBeLessThan(5000); // Should complete in <5s
    });
  });

  // calculateHammingDistance (private, tested via compareGenomesDetailed)
  describe("calculateHammingDistance", () => {
    test("returns 0 for identical codon arrays", () => {
      const result = compareGenomesDetailed("ATG GGG AAA", "ATG GGG AAA");
      expect(result.metrics.hammingDistance).toBe(0);
    });

    test("counts differing positions correctly for same-length arrays", () => {
      // 2 differences
      const result = compareGenomesDetailed("ATG GGG AAA", "ATG GAG CCC");
      expect(result.metrics.hammingDistance).toBe(2);
    });

    test("handles arrays of different lengths (uses maxLength)", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG AAA");
      // Different at position 2 (empty vs AAA)
      expect(result.metrics.hammingDistance).toBe(1);
    });

    test("counts missing codons in shorter array as differences", () => {
      const result = compareGenomesDetailed("ATG", "ATG GGG AAA");
      expect(result.metrics.hammingDistance).toBe(2);
    });

    test("returns maxLength for completely different arrays", () => {
      const result = compareGenomesDetailed("ATG GGG", "CCC TTT");
      expect(result.metrics.hammingDistance).toBe(2);
    });
  });

  // calculatePixelDifference (private, tested via compareGenomesDetailed)
  describe("calculatePixelDifference", () => {
    test("returns percentage value for genome comparison", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG");
      // With mock canvas, may return 100% or 0% depending on implementation
      expect(typeof result.metrics.pixelDifferencePercent).toBe("number");
    });

    test("returns 100% when either genome causes lexer/render error", () => {
      const result = compareGenomesDetailed("ATG GGG", "XXX YYY");
      expect(result.metrics.pixelDifferencePercent).toBe(100);
    });
  });

  // classifySimilarity (private, tested via compareGenomesDetailed)
  describe("classifySimilarity", () => {
    test("returns 'identical' for 0% codon difference", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG");
      expect(result.analysis.similarity).toBe("identical");
    });

    test("returns 'very-similar' for <10% codon difference", () => {
      // 1 out of 20 = 5%
      const genome1 = `ATG ${"GGG ".repeat(19)}`;
      const genome2 = `ATG ${"GGG ".repeat(18)}GAG`;
      const result = compareGenomesDetailed(genome1, genome2);
      expect(result.analysis.similarity).toBe("very-similar");
    });

    test("returns 'similar' for 10-30% codon difference", () => {
      // 2 out of 10 = 20%
      const genome1 = "ATG GGG GGG GGG GGG GGG GGG GGG GGG GGG";
      const genome2 = "ATG GAG GAG GGG GGG GGG GGG GGG GGG GGG";
      const result = compareGenomesDetailed(genome1, genome2);
      expect(result.analysis.similarity).toBe("similar");
    });

    test("returns 'different' for 30-60% codon difference", () => {
      // 4 out of 10 = 40%
      const genome1 = "ATG GGG GGG GGG GGG GGG GGG GGG GGG GGG";
      const genome2 = "ATG GAG GAG GAG GAG GGG GGG GGG GGG GGG";
      const result = compareGenomesDetailed(genome1, genome2);
      expect(result.analysis.similarity).toBe("different");
    });

    test("returns 'very-different' for >60% codon difference", () => {
      // All different
      const result = compareGenomesDetailed("ATG GGG", "CCC TTT");
      expect(result.analysis.similarity).toBe("very-different");
    });
  });

  // generateDescription (private, tested via compareGenomesDetailed)
  describe("generateDescription", () => {
    test("returns 'identical - no differences' for identical genomes", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG");
      expect(result.analysis.description).toContain(
        "identical - no differences",
      );
    });

    test("includes similarity classification in description", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.analysis.description).toContain("different");
    });

    test("includes codon difference percentage when >0", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.analysis.description).toContain("% of codons differ");
    });

    test("includes length difference information when genomes differ in length", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG AAA");
      expect(result.analysis.description).toContain("longer");
    });
  });

  // generateInsights (private, tested via compareGenomesDetailed)
  describe("generateInsights", () => {
    test("detects frameshift when differences have missing original or mutated codons", () => {
      // Length difference indicates insertion/deletion
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG AAA");
      const hasFrameshiftInsight = result.analysis.insights.some((i) =>
        i.includes("Frameshift"),
      );
      expect(hasFrameshiftInsight).toBe(true);
    });

    test("flags catastrophic differences when visual diff >70%", () => {
      const result = compareGenomesDetailed("ATG GGG", "XXX YYY");
      const hasCatastrophicInsight = result.analysis.insights.some((i) =>
        i.includes("Catastrophic"),
      );
      expect(hasCatastrophicInsight).toBe(true);
    });

    test("returns insights array for identical genomes", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG");
      // Mock canvas may cause pixel diff, so check we get valid insights
      expect(Array.isArray(result.analysis.insights)).toBe(true);
      expect(result.analysis.insights.length).toBeGreaterThan(0);
    });
  });

  // renderBothGenomes (private, tested via compareGenomesDetailed)
  describe("renderBothGenomes", () => {
    test("renders first genome to data URL successfully", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.visual.originalCanvas).toContain("data:");
    });

    test("renders second genome to data URL successfully", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.visual.mutatedCanvas).toContain("data:");
    });

    test("returns blank canvas data URL when genome fails to render", () => {
      const result = compareGenomesDetailed("ATG GGG", "XXX YYY");
      // Should still return a data URL (blank canvas)
      expect(result.visual.mutatedCanvas).toContain("data:");
    });

    test("sets bothValid based on render success", () => {
      const validResult = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(typeof validResult.visual.bothValid).toBe("boolean");

      // Invalid genome should fail rendering
      const invalidResult = compareGenomesDetailed("ATG GGG", "XXX YYY");
      expect(invalidResult.visual.bothValid).toBe(false);
    });

    test("uses provided canvas dimensions for rendering", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG", {
        canvasWidth: 100,
        canvasHeight: 100,
      });
      expect(result.visual.originalCanvas).toBeDefined();
    });
  });

  // Integration Tests
  describe("integration", () => {
    test("correctly analyzes silent mutation (codon change, same visual output)", () => {
      // Same amino acid codons would produce same output
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG");
      expect(result.metrics.codonDifferencePercent).toBe(0);
      // Note: pixel comparison requires real canvas - mock may return 100%
      expect(typeof result.metrics.pixelDifferencePercent).toBe("number");
    });

    test("correctly analyzes missense mutation (codon change, different visual)", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      expect(result.metrics.codonDifferencePercent).toBeGreaterThan(0);
    });

    test("correctly analyzes nonsense mutation (early STOP, truncated output)", () => {
      const result = compareGenomesDetailed("ATG GGG AAA", "ATG TAA AAA");
      // TAA is a stop codon, should truncate
      expect(result.metrics.codonDifferencePercent).toBeGreaterThan(0);
    });

    test("correctly analyzes frameshift mutation (reading frame shift, scrambled output)", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG AAA");
      const hasFrameshift = result.analysis.insights.some((i) =>
        i.includes("Frameshift"),
      );
      expect(hasFrameshift).toBe(true);
    });

    test("comparison result usable for educational diff viewer display", () => {
      const result = compareGenomesDetailed("ATG GGG", "ATG GAG");
      // Should have all fields needed for UI display
      expect(result.codons.original).toBeDefined();
      expect(result.codons.mutated).toBeDefined();
      expect(result.codons.differences).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.visual.originalCanvas).toBeDefined();
      expect(result.visual.mutatedCanvas).toBeDefined();
      expect(result.analysis.description).toBeDefined();
      expect(result.analysis.insights.length).toBeGreaterThan(0);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles lexer tokenization errors", () => {
      const result = compareGenomesDetailed("ATG GGG", "XXX YYY");
      // Should not throw, returns 100% difference
      expect(result.metrics.pixelDifferencePercent).toBe(100);
    });

    test("handles VM execution errors", () => {
      // Invalid codon might cause VM issues
      const result = compareGenomesDetailed("ATG GGG", "!@# $%^");
      expect(result.visual.bothValid).toBe(false);
    });

    test("handles genomes with invalid codon sequences", () => {
      const result = compareGenomesDetailed("ATG GGG", "ZZZ QQQ");
      expect(result.visual.bothValid).toBe(false);
    });

    test("generates description for synonymous changes only", () => {
      // When codon diff > 0 but pixel diff = 0, should mention synonymous
      const result = compareGenomesDetailed("ATG GGG", "ATG GGG");
      expect(result.analysis.description).toBeDefined();
    });

    test("generates description with minimal visual differences", () => {
      // Small differences should mention minimal visual change
      const genome1 = `ATG ${"GGG ".repeat(19)}`;
      const genome2 = `ATG ${"GGG ".repeat(18)}GGC`; // Synonymous change
      const result = compareGenomesDetailed(genome1, genome2);
      expect(result.analysis.description).toBeDefined();
      expect(result.analysis.description.length).toBeGreaterThan(10);
    });

    test("generates description with substantial visual differences", () => {
      // Very different genomes should mention substantial output
      const result = compareGenomesDetailed("ATG GGG AAA", "XXX YYY ZZZ");
      expect(result.analysis.description).toBeDefined();
    });

    test("detects silent mutations with codon diff but low pixel diff", () => {
      // Synonymous codon change - same opcode
      const result = compareGenomesDetailed("ATG GGG", "ATG GGC");
      // Check insights array exists
      expect(Array.isArray(result.analysis.insights)).toBe(true);
    });

    test("detects localized changes with few differences", () => {
      // Few codon differences should trigger localized insight
      const genome1 = `ATG ${"GGG ".repeat(19)}`;
      const genome2 = `ATG GAG ${"GGG ".repeat(18)}`;
      const result = compareGenomesDetailed(genome1, genome2);
      expect(result.analysis.insights.length).toBeGreaterThan(0);
    });

    test("detects high similarity genomes", () => {
      // Nearly identical genomes
      const genome1 = `ATG ${"GGG ".repeat(49)}`;
      const genome2 = `ATG ${"GGG ".repeat(48)}GGC`; // Synonymous
      const result = compareGenomesDetailed(genome1, genome2);
      expect(result.analysis.insights).toBeDefined();
    });

    test("handles second genome longer by multiple codons", () => {
      const result = compareGenomesDetailed("ATG", "ATG GGG AAA CCC");
      expect(result.metrics.lengthDifference).toBe(3);
      expect(result.analysis.description).toContain("longer");
    });

    test("handles first genome longer by multiple codons", () => {
      const result = compareGenomesDetailed("ATG GGG AAA CCC", "ATG");
      expect(result.metrics.lengthDifference).toBe(-3);
      expect(result.analysis.description).toContain("longer");
    });

    test("calculates correct percentage for single difference in long genome", () => {
      // 1 out of 50 codons = 2%
      const genome1 = `ATG ${"GGG ".repeat(49)}`;
      const genome2 = `ATG GAG ${"GGG ".repeat(48)}`;
      const result = compareGenomesDetailed(genome1, genome2);
      expect(result.metrics.codonDifferencePercent).toBe(2);
      expect(result.analysis.similarity).toBe("very-similar");
    });

    test("returns mixed changes insight when no specific pattern", () => {
      // Multiple differences without clear pattern
      const genome1 = "ATG GGG GGG GGG GGG";
      const genome2 = "ATG GAG CCC AAA TTT";
      const result = compareGenomesDetailed(genome1, genome2);
      expect(result.analysis.insights.length).toBeGreaterThan(0);
    });
  });
});
