/**
 * @fileoverview Tests for codon usage analyzer
 */

import { describe, expect, test } from "bun:test";
import {
  analyzeCodonUsage,
  compareAnalyses,
  formatAnalysis,
} from "@/codon-analyzer";
import type { CodonToken } from "@/types";

describe("CodonAnalyzer", () => {
  describe("analyzeCodonUsage", () => {
    test("should count total codons correctly", () => {
      const tokens: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 },
        { text: "GGA", position: 3, line: 1 },
        { text: "TAA", position: 6, line: 1 },
      ];

      const analysis = analyzeCodonUsage(tokens);
      expect(analysis.totalCodons).toBe(3);
    });

    test("should calculate GC content correctly", () => {
      // GGA has 2 Gs and 1 A → GC% = 2/3 = 66.67%
      const tokens: CodonToken[] = [{ text: "GGA", position: 0, line: 1 }];

      const analysis = analyzeCodonUsage(tokens);
      expect(analysis.gcContent).toBeCloseTo(66.67, 1);
      expect(analysis.atContent).toBeCloseTo(33.33, 1);
    });

    test("should handle RNA codons (normalize U→T)", () => {
      const tokens: CodonToken[] = [
        { text: "AUG", position: 0, line: 1 }, // RNA start codon
        { text: "GGA", position: 3, line: 1 },
        { text: "UAA", position: 6, line: 1 }, // RNA stop codon
      ];

      const analysis = analyzeCodonUsage(tokens);
      expect(analysis.totalCodons).toBe(3);
      expect(analysis.opcodeDistribution.get("START")).toBe(1);
      expect(analysis.opcodeDistribution.get("STOP")).toBe(1);
    });

    test("should count codon frequency correctly", () => {
      const tokens: CodonToken[] = [
        { text: "GGA", position: 0, line: 1 },
        { text: "GGA", position: 3, line: 1 },
        { text: "GGC", position: 6, line: 1 }, // Synonymous with GGA
        { text: "CCA", position: 9, line: 1 },
      ];

      const analysis = analyzeCodonUsage(tokens);
      expect(analysis.codonFrequency.get("GGA")).toBe(2);
      expect(analysis.codonFrequency.get("GGC")).toBe(1);
      expect(analysis.codonFrequency.get("CCA")).toBe(1);
    });

    test("should calculate opcode distribution correctly", () => {
      const tokens: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 }, // START
        { text: "GGA", position: 3, line: 1 }, // CIRCLE
        { text: "GGC", position: 6, line: 1 }, // CIRCLE (synonymous)
        { text: "CCA", position: 9, line: 1 }, // RECT
        { text: "TAA", position: 12, line: 1 }, // STOP
      ];

      const analysis = analyzeCodonUsage(tokens);
      expect(analysis.opcodeDistribution.get("START")).toBe(1);
      expect(analysis.opcodeDistribution.get("CIRCLE")).toBe(2); // GGA + GGC
      expect(analysis.opcodeDistribution.get("RECT")).toBe(1);
      expect(analysis.opcodeDistribution.get("STOP")).toBe(1);
    });

    test("should calculate opcode family percentages", () => {
      const tokens: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 }, // control
        { text: "GGA", position: 3, line: 1 }, // drawing
        { text: "GGA", position: 6, line: 1 }, // drawing
        { text: "ACA", position: 9, line: 1 }, // transform
        { text: "GAA", position: 12, line: 1 }, // stack (PUSH)
        { text: "AAA", position: 15, line: 1 }, // stack (PUSH literal - also counted as PUSH)
        { text: "TAA", position: 18, line: 1 }, // control
      ];

      const analysis = analyzeCodonUsage(tokens);
      // 7 total codons: 2 control, 3 drawing (2 GGA count), 1 transform, 3 stack (GAA + AAA both map to opcodes)
      // Wait - need to check: does AAA map to LINE or is test treated as literal?
      // AAA maps to LINE opcode in CODON_MAP, so test's a drawing opcode!
      // Corrected: 2 control, 3 drawing (GGA, GGA, AAA=LINE), 1 transform, 1 stack (GAA=PUSH)
      expect(analysis.opcodeFamilies.control).toBeCloseTo(28.57, 1); // 2/7
      expect(analysis.opcodeFamilies.drawing).toBeCloseTo(42.86, 1); // 3/7 (GGA+GGA+AAA)
      expect(analysis.opcodeFamilies.transform).toBeCloseTo(14.29, 1); // 1/7
      expect(analysis.opcodeFamilies.stack).toBeCloseTo(14.29, 1); // 1/7 (GAA only)
    });

    test("should identify top codons", () => {
      const tokens: CodonToken[] = [
        { text: "GGA", position: 0, line: 1 },
        { text: "GGA", position: 3, line: 1 },
        { text: "GGA", position: 6, line: 1 },
        { text: "CCA", position: 9, line: 1 },
        { text: "CCA", position: 12, line: 1 },
        { text: "AAA", position: 15, line: 1 },
      ];

      const analysis = analyzeCodonUsage(tokens);
      expect(analysis.topCodons).toHaveLength(3);
      expect(analysis.topCodons[0].codon).toBe("GGA");
      expect(analysis.topCodons[0].count).toBe(3);
      expect(analysis.topCodons[0].percentage).toBeCloseTo(50, 1);
    });

    test("should calculate genome signature metrics", () => {
      const tokens: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 }, // control
        { text: "GGA", position: 3, line: 1 }, // drawing
        { text: "ACA", position: 6, line: 1 }, // transform
        { text: "TAA", position: 9, line: 1 }, // control
      ];

      const analysis = analyzeCodonUsage(tokens);
      expect(analysis.signature.drawingDensity).toBeCloseTo(25, 1); // 1/4
      expect(analysis.signature.transformDensity).toBeCloseTo(25, 1); // 1/4
      expect(analysis.signature.complexity).toBeGreaterThan(0); // unique opcodes / total
    });

    test("should calculate codon family usage", () => {
      const tokens: CodonToken[] = [
        { text: "GGA", position: 0, line: 1 }, // GG* family
        { text: "GGC", position: 3, line: 1 }, // GG* family
        { text: "CCA", position: 6, line: 1 }, // CC* family
      ];

      const analysis = analyzeCodonUsage(tokens);
      expect(analysis.codonFamilyUsage.get("GG")).toBe(2);
      expect(analysis.codonFamilyUsage.get("CC")).toBe(1);
    });
  });

  describe("compareAnalyses", () => {
    test("should return 100 for identical analyses", () => {
      const tokens: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 },
        { text: "GGA", position: 3, line: 1 },
        { text: "TAA", position: 6, line: 1 },
      ];

      const analysis1 = analyzeCodonUsage(tokens);
      const analysis2 = analyzeCodonUsage(tokens);

      const similarity = compareAnalyses(analysis1, analysis2);
      expect(similarity).toBeCloseTo(100, 0);
    });

    test("should return lower score for different analyses", () => {
      const tokens1: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 },
        { text: "GGA", position: 3, line: 1 }, // drawing-heavy
        { text: "GGA", position: 6, line: 1 },
        { text: "GGA", position: 9, line: 1 },
        { text: "TAA", position: 12, line: 1 },
      ];

      const tokens2: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 },
        { text: "ACA", position: 3, line: 1 }, // transform-heavy
        { text: "ACA", position: 6, line: 1 },
        { text: "ACA", position: 9, line: 1 },
        { text: "TAA", position: 12, line: 1 },
      ];

      const analysis1 = analyzeCodonUsage(tokens1);
      const analysis2 = analyzeCodonUsage(tokens2);

      const similarity = compareAnalyses(analysis1, analysis2);
      expect(similarity).toBeLessThan(100);
      expect(similarity).toBeGreaterThan(0);
    });
  });

  describe("formatAnalysis", () => {
    test("should produce readable text output", () => {
      const tokens: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 },
        { text: "GGA", position: 3, line: 1 },
        { text: "CCA", position: 6, line: 1 },
        { text: "TAA", position: 9, line: 1 },
      ];

      const analysis = analyzeCodonUsage(tokens);
      const formatted = formatAnalysis(analysis);

      expect(formatted).toContain("Total Codons: 4");
      expect(formatted).toContain("GC Content:");
      expect(formatted).toContain("Top 5 Codons:");
      expect(formatted).toContain("Opcode Family Distribution:");
      expect(formatted).toContain("Genome Signature:");
    });
  });

  describe("Real-world genome examples", () => {
    test("should analyze a simple circle genome", () => {
      const tokens: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 }, // START
        { text: "GAA", position: 3, line: 1 }, // PUSH
        { text: "AGG", position: 6, line: 1 }, // literal: 10
        { text: "GGA", position: 9, line: 1 }, // CIRCLE
        { text: "TAA", position: 12, line: 1 }, // STOP
      ];

      const analysis = analyzeCodonUsage(tokens);

      expect(analysis.totalCodons).toBe(5);
      expect(analysis.opcodeDistribution.get("CIRCLE")).toBe(1);
      expect(analysis.opcodeDistribution.get("PUSH")).toBe(1);
      expect(analysis.opcodeFamilies.drawing).toBeGreaterThan(0);
      expect(analysis.opcodeFamilies.stack).toBeGreaterThan(0);
    });

    test("should analyze a complex multi-shape genome", () => {
      const tokens: CodonToken[] = [
        { text: "ATG", position: 0, line: 1 }, // START
        { text: "GAA", position: 3, line: 1 }, // PUSH
        { text: "CCC", position: 6, line: 1 }, // literal
        { text: "GGA", position: 9, line: 1 }, // CIRCLE
        { text: "GAA", position: 12, line: 1 }, // PUSH
        { text: "CCC", position: 15, line: 1 }, // literal
        { text: "GAA", position: 18, line: 1 }, // PUSH
        { text: "AAA", position: 21, line: 1 }, // literal
        { text: "ACA", position: 24, line: 1 }, // TRANSLATE
        { text: "GAA", position: 27, line: 1 }, // PUSH
        { text: "AGG", position: 30, line: 1 }, // literal
        { text: "CCA", position: 33, line: 1 }, // RECT
        { text: "TAA", position: 36, line: 1 }, // STOP
      ];

      const analysis = analyzeCodonUsage(tokens);

      expect(analysis.totalCodons).toBe(13);
      expect(analysis.opcodeFamilies.drawing).toBeGreaterThan(0);
      expect(analysis.opcodeFamilies.transform).toBeGreaterThan(0);
      expect(analysis.opcodeFamilies.stack).toBeGreaterThan(0);
      expect(analysis.signature.drawingDensity).toBeGreaterThan(0);
      expect(analysis.signature.transformDensity).toBeGreaterThan(0);
    });
  });
});
