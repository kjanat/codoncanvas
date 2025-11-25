import { describe, expect, test } from "vitest";
import { CodonLexer } from "./lexer";

describe("CodonLexer", () => {
  const lexer = new CodonLexer();

  describe("tokenize", () => {
    test("tokenizes simple genome", () => {
      const genome = "ATG GGA TAA";
      const tokens = lexer.tokenize(genome);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe("ATG");
      expect(tokens[1].text).toBe("GGA");
      expect(tokens[2].text).toBe("TAA");
    });

    test("strips comments", () => {
      const genome = "ATG ; this is a comment\nGGA TAA";
      const tokens = lexer.tokenize(genome);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe("ATG");
    });

    test("handles multi-line genomes", () => {
      const genome = `ATG
        GAA AAT GGA
        TAA`;
      const tokens = lexer.tokenize(genome);

      expect(tokens).toHaveLength(5);
      expect(tokens[0].text).toBe("ATG");
      expect(tokens[1].text).toBe("GAA");
      expect(tokens[2].text).toBe("AAT");
      expect(tokens[3].text).toBe("GGA");
      expect(tokens[4].text).toBe("TAA");
    });

    test("throws on invalid character", () => {
      const genome = "ATG GXA TAA";
      expect(() => lexer.tokenize(genome)).toThrow("Invalid character");
    });

    test("throws on non-triplet length", () => {
      const genome = "ATG GG";
      expect(() => lexer.tokenize(genome)).toThrow("not divisible by 3");
    });

    test("accepts RNA notation (U instead of T)", () => {
      const rnaGenome = "AUG GGA UAA";
      const tokens = lexer.tokenize(rnaGenome);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe("ATG"); // U→T normalized
      expect(tokens[1].text).toBe("GGA");
      expect(tokens[2].text).toBe("TAA"); // U→T normalized
    });

    test("handles mixed DNA and RNA notation", () => {
      const mixedGenome = "ATG GGA UAA"; // DNA start, RNA stop
      const tokens = lexer.tokenize(mixedGenome);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe("ATG");
      expect(tokens[2].text).toBe("TAA"); // U→T normalized
    });

    test("RNA genome produces same result as DNA equivalent", () => {
      const dnaGenome = "ATG GAA AAT GGA TAA";
      const rnaGenome = "AUG GAA AAU GGA UAA";

      const dnaTokens = lexer.tokenize(dnaGenome);
      const rnaTokens = lexer.tokenize(rnaGenome);

      expect(rnaTokens).toEqual(dnaTokens);
    });
  });

  describe("validateFrame", () => {
    test("detects mid-triplet break", () => {
      const source = "ATG GG A CCA TAA";
      const errors = lexer.validateFrame(source);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].severity).toBe("warning");
      expect(errors[0].message).toContain("Mid-triplet");
    });

    test("accepts proper frame alignment", () => {
      const source = "ATG GGA CCA TAA";
      const errors = lexer.validateFrame(source);

      expect(errors).toHaveLength(0);
    });
  });

  describe("validateStructure", () => {
    test("warns on missing START", () => {
      const tokens = lexer.tokenize("GGA CCA TAA");
      const errors = lexer.validateStructure(tokens);

      const startError = errors.find((e) => e.message.includes("START"));
      expect(startError).toBeDefined();
      expect(startError?.severity).toBe("error");
    });

    test("warns on missing STOP", () => {
      const tokens = lexer.tokenize("ATG GGA CCA");
      const errors = lexer.validateStructure(tokens);

      const stopError = errors.find((e) => e.message.includes("STOP"));
      expect(stopError).toBeDefined();
      expect(stopError?.severity).toBe("warning");
    });

    test("warns on START after STOP", () => {
      const tokens = lexer.tokenize("ATG GGA TAA ATG CCA TAA");
      const errors = lexer.validateStructure(tokens);

      const unreachableError = errors.find((e) =>
        e.message.includes("START codon after STOP")
      );
      expect(unreachableError).toBeDefined();
      expect(unreachableError?.severity).toBe("warning");
    });

    test("accepts proper structure", () => {
      const tokens = lexer.tokenize("ATG GGA CCA TAA");
      const errors = lexer.validateStructure(tokens);

      expect(errors.every((e) => e.severity !== "error")).toBe(true);
    });
  });
});
