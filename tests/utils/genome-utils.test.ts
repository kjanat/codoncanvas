/**
 * Genome Utilities Test Suite
 *
 * Tests for genome string manipulation and parsing utilities.
 */
import { describe, expect, test } from "bun:test";
import {
  cleanGenome,
  extractCommentValues,
  findNumericLiterals,
  formatAsCodons,
  type GenomeLine,
  isPushCodon,
  type NumericLiteral,
  parseGenome,
  parseGenomeLines,
} from "@/utils/genome-utils";

describe("genome-utils", () => {
  // ============ cleanGenome ============
  describe("cleanGenome", () => {
    test("removes whitespace", () => {
      expect(cleanGenome("ATG GGA TAA")).toBe("ATGGGATAA");
    });

    test("removes comments (strips everything after ;)", () => {
      // Note: whitespace is removed first, so "comment\nTAA" becomes "commentTAA"
      // then ;.* removes everything from ; onwards
      expect(cleanGenome("ATG GGA ; comment\nTAA")).toBe("ATGGGA");
      // For multi-line with comments per line, use parseGenome instead
    });

    test("removes newlines", () => {
      expect(cleanGenome("ATG\n  GGA\n  TAA")).toBe("ATGGGATAA");
    });

    test("preserves case by default", () => {
      expect(cleanGenome("atg gga taa")).toBe("atgggataa");
    });

    test("uppercases with option", () => {
      expect(cleanGenome("atg gga taa", { uppercase: true })).toBe("ATGGGATAA");
    });
  });

  // ============ parseGenome ============
  describe("parseGenome", () => {
    test("parses simple genome", () => {
      expect(parseGenome("ATG GGA TAA")).toEqual(["ATG", "GGA", "TAA"]);
    });

    test("handles newlines", () => {
      expect(parseGenome("ATG\nGGA\nTAA")).toEqual(["ATG", "GGA", "TAA"]);
    });

    test("strips comments", () => {
      expect(parseGenome("ATG\nGGA ; circle\nTAA")).toEqual([
        "ATG",
        "GGA",
        "TAA",
      ]);
    });

    test("handles multi-codon lines", () => {
      expect(parseGenome("ATG GAA CCC GGA TAA")).toEqual([
        "ATG",
        "GAA",
        "CCC",
        "GGA",
        "TAA",
      ]);
    });
  });

  // ============ formatAsCodons ============
  describe("formatAsCodons", () => {
    test("formats continuous bases as codons", () => {
      expect(formatAsCodons("ATGGGATAA")).toBe("ATG GGA TAA");
    });

    test("handles incomplete last codon", () => {
      expect(formatAsCodons("ATGGGA")).toBe("ATG GGA");
    });

    test("handles empty string", () => {
      expect(formatAsCodons("")).toBe("");
    });
  });

  // ============ parseGenomeLines ============
  describe("parseGenomeLines", () => {
    test("parses single line without comment", () => {
      const result = parseGenomeLines("ATG GGA TAA");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        lineNumber: 1,
        codons: ["ATG", "GGA", "TAA"],
        comment: null,
        raw: "ATG GGA TAA",
      } satisfies GenomeLine);
    });

    test("parses line with comment", () => {
      const result = parseGenomeLines("GAA CCC GGA  ; Push 21, draw circle");
      expect(result).toHaveLength(1);
      expect(result[0].codons).toEqual(["GAA", "CCC", "GGA"]);
      expect(result[0].comment).toBe("Push 21, draw circle");
    });

    test("parses multiple lines", () => {
      const genome = `ATG
  GAA CCC GGA  ; Push 21, circle
TAA`;
      const result = parseGenomeLines(genome);
      expect(result).toHaveLength(3);
      expect(result[0].codons).toEqual(["ATG"]);
      expect(result[1].codons).toEqual(["GAA", "CCC", "GGA"]);
      expect(result[1].comment).toBe("Push 21, circle");
      expect(result[2].codons).toEqual(["TAA"]);
    });

    test("handles comment-only lines", () => {
      const result = parseGenomeLines("; This is a comment");
      expect(result).toHaveLength(1);
      expect(result[0].codons).toEqual([]);
      expect(result[0].comment).toBe("This is a comment");
    });

    test("handles empty lines", () => {
      const result = parseGenomeLines("ATG\n\nTAA");
      expect(result).toHaveLength(3);
      expect(result[1].codons).toEqual([]);
      expect(result[1].comment).toBeNull();
    });

    test("normalizes codons to uppercase", () => {
      const result = parseGenomeLines("atg gga taa");
      expect(result[0].codons).toEqual(["ATG", "GGA", "TAA"]);
    });

    test("preserves line numbers", () => {
      const result = parseGenomeLines("ATG\nGGA\nTAA");
      expect(result[0].lineNumber).toBe(1);
      expect(result[1].lineNumber).toBe(2);
      expect(result[2].lineNumber).toBe(3);
    });

    test("filters invalid codons", () => {
      const result = parseGenomeLines("ATG XX GGA 123 TAA");
      expect(result[0].codons).toEqual(["ATG", "GGA", "TAA"]);
    });
  });

  // ============ isPushCodon ============
  describe("isPushCodon", () => {
    test.each([
      ["GAA", true],
      ["GAC", true],
      ["GAG", true],
      ["GAT", true],
      ["GGA", false],
      ["ATG", false],
      ["TAA", false],
      ["gaa", true], // case insensitive
    ])("isPushCodon(%s) = %s", (codon, expected) => {
      expect(isPushCodon(codon)).toBe(expected);
    });
  });

  // ============ findNumericLiterals ============
  describe("findNumericLiterals", () => {
    test("finds literal after PUSH", () => {
      const result = findNumericLiterals(["GAA", "CCC", "GGA"]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        index: 1,
        codon: "CCC",
        value: 21, // CCC decodes to 21
      } satisfies NumericLiteral);
    });

    test("finds multiple literals", () => {
      // GAA CCC GAA AAA = Push 21, Push 0
      const result = findNumericLiterals(["GAA", "CCC", "GAA", "AAA"]);
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(21);
      expect(result[1].value).toBe(0);
    });

    test("handles no PUSH opcodes", () => {
      const result = findNumericLiterals(["ATG", "GGA", "TAA"]);
      expect(result).toHaveLength(0);
    });

    test("handles PUSH at end (no following codon)", () => {
      const result = findNumericLiterals(["ATG", "GAA"]);
      expect(result).toHaveLength(0);
    });

    test("handles consecutive PUSHes", () => {
      // GAA GAA CCC = Push, Push, (CCC is literal for second GAA)
      const result = findNumericLiterals(["GAA", "GAA", "CCC"]);
      // First GAA: next is GAA (value 32)
      // Second GAA: next is CCC (value 21)
      expect(result).toHaveLength(2);
      expect(result[0].codon).toBe("GAA");
      expect(result[1].codon).toBe("CCC");
    });
  });

  // ============ extractCommentValues ============
  describe("extractCommentValues", () => {
    test("extracts Color(r, g, b) values", () => {
      expect(extractCommentValues("Set color (21, 0, 0) - red")).toEqual([
        21, 0,
      ]);
    });

    test("extracts operation values", () => {
      expect(extractCommentValues("Rotate 30 degrees")).toEqual([30]);
      expect(extractCommentValues("Circle 21")).toEqual([21]);
      expect(extractCommentValues("PUSH 37")).toEqual([37]);
    });

    test("extracts Ellipse WxH values", () => {
      expect(extractCommentValues("Ellipse 53x21")).toEqual([53, 21]);
    });

    test("extracts standalone numbers", () => {
      expect(extractCommentValues("value is 42")).toEqual([42]);
    });

    test("filters values outside 0-63 range", () => {
      expect(extractCommentValues("value 100")).toEqual([]);
      // Note: -5 matches as "5" due to standalone number pattern
      expect(extractCommentValues("value -5")).toEqual([5]);
    });

    test("deduplicates values", () => {
      // "21" appears in both color and circle
      expect(extractCommentValues("Color(21, 21, 21) Circle 21")).toEqual([21]);
    });

    test("handles empty comment", () => {
      expect(extractCommentValues("")).toEqual([]);
    });

    test("handles comment with no numbers", () => {
      expect(extractCommentValues("draw a circle")).toEqual([]);
    });

    test("extracts from complex comment", () => {
      const result = extractCommentValues("Set color (63, 53, 37) - golden");
      expect(result).toEqual([63, 53, 37]);
    });
  });
});
