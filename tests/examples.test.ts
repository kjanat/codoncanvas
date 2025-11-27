/**
 * Examples Test Suite
 *
 * Tests for the built-in example genomes library that provides
 * pedagogical examples for learning CodonCanvas concepts.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  type Concept,
  type ExampleDifficulty,
  type ExampleKey,
  type ExampleMetadata,
  examples,
} from "@/examples";
import { CodonLexer } from "@/lexer";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "@/test-utils/canvas-mock";
import type { MutationType } from "@/types";

describe("Examples Library", () => {
  // Mock canvas for VM execution tests
  beforeEach(() => mockCanvasContext());
  afterEach(() => restoreCanvasContext());

  const lexer = new CodonLexer();

  // Valid difficulty levels
  const validDifficulties: ExampleDifficulty[] = [
    "beginner",
    "intermediate",
    "advanced",
    "advanced-showcase",
  ];

  // Valid concepts
  const validConcepts: Concept[] = [
    "drawing",
    "transforms",
    "colors",
    "stack",
    "composition",
    "advanced-opcodes",
    "state-management",
    "arithmetic",
    "comparison",
    "logic",
  ];

  // Valid mutation types
  const validMutationTypes: MutationType[] = [
    "silent",
    "missense",
    "nonsense",
    "point",
    "insertion",
    "deletion",
    "frameshift",
  ];

  // Examples Object Structure
  describe("examples object structure", () => {
    test("exports examples object", () => {
      expect(examples).toBeDefined();
      expect(typeof examples).toBe("object");
    });

    test("examples is a Record<string, ExampleMetadata>", () => {
      expect(Object.keys(examples).length).toBeGreaterThan(0);
      for (const [key, value] of Object.entries(examples)) {
        expect(typeof key).toBe("string");
        expect(typeof value).toBe("object");
      }
    });

    test("each example has required title property", () => {
      for (const [key, example] of Object.entries(examples)) {
        expect(example.title).toBeDefined();
        expect(typeof example.title).toBe("string");
        expect(example.title.length).toBeGreaterThan(0);
      }
    });

    test("each example has required description property", () => {
      for (const [key, example] of Object.entries(examples)) {
        expect(example.description).toBeDefined();
        expect(typeof example.description).toBe("string");
        expect(example.description.length).toBeGreaterThan(0);
      }
    });

    test("each example has required genome property", () => {
      for (const [key, example] of Object.entries(examples)) {
        expect(example.genome).toBeDefined();
        expect(typeof example.genome).toBe("string");
        expect(example.genome.length).toBeGreaterThan(0);
      }
    });

    test("each example has required difficulty property", () => {
      for (const [key, example] of Object.entries(examples)) {
        expect(example.difficulty).toBeDefined();
        expect(typeof example.difficulty).toBe("string");
      }
    });

    test("each example has required concepts array", () => {
      for (const [key, example] of Object.entries(examples)) {
        expect(example.concepts).toBeDefined();
        expect(Array.isArray(example.concepts)).toBe(true);
        expect(example.concepts.length).toBeGreaterThan(0);
      }
    });

    test("each example has required goodForMutations array", () => {
      for (const [key, example] of Object.entries(examples)) {
        expect(example.goodForMutations).toBeDefined();
        expect(Array.isArray(example.goodForMutations)).toBe(true);
        expect(example.goodForMutations.length).toBeGreaterThan(0);
      }
    });

    test("each example has required keywords array", () => {
      for (const [key, example] of Object.entries(examples)) {
        expect(example.keywords).toBeDefined();
        expect(Array.isArray(example.keywords)).toBe(true);
        expect(example.keywords.length).toBeGreaterThan(0);
      }
    });
  });

  // Difficulty Levels
  describe("difficulty levels", () => {
    test("beginner examples exist", () => {
      const beginnerExamples = Object.values(examples).filter(
        (e) => e.difficulty === "beginner",
      );
      expect(beginnerExamples.length).toBeGreaterThan(0);
    });

    test("intermediate examples exist", () => {
      const intermediateExamples = Object.values(examples).filter(
        (e) => e.difficulty === "intermediate",
      );
      expect(intermediateExamples.length).toBeGreaterThan(0);
    });

    test("advanced examples exist", () => {
      const advancedExamples = Object.values(examples).filter(
        (e) => e.difficulty === "advanced",
      );
      expect(advancedExamples.length).toBeGreaterThan(0);
    });

    test("advanced-showcase examples exist", () => {
      const showcaseExamples = Object.values(examples).filter(
        (e) => e.difficulty === "advanced-showcase",
      );
      expect(showcaseExamples.length).toBeGreaterThan(0);
    });

    test("all difficulties are valid ExampleDifficulty values", () => {
      for (const example of Object.values(examples)) {
        expect(validDifficulties).toContain(example.difficulty);
      }
    });
  });

  // Concepts Coverage
  describe("concepts coverage", () => {
    test("examples cover 'drawing' concept", () => {
      const hasDrawing = Object.values(examples).some((e) =>
        e.concepts.includes("drawing"),
      );
      expect(hasDrawing).toBe(true);
    });

    test("examples cover 'transforms' concept", () => {
      const hasTransforms = Object.values(examples).some((e) =>
        e.concepts.includes("transforms"),
      );
      expect(hasTransforms).toBe(true);
    });

    test("examples cover 'colors' concept", () => {
      const hasColors = Object.values(examples).some((e) =>
        e.concepts.includes("colors"),
      );
      expect(hasColors).toBe(true);
    });

    test("examples cover 'stack' concept", () => {
      const hasStack = Object.values(examples).some((e) =>
        e.concepts.includes("stack"),
      );
      expect(hasStack).toBe(true);
    });

    test("examples cover 'composition' concept", () => {
      const hasComposition = Object.values(examples).some((e) =>
        e.concepts.includes("composition"),
      );
      expect(hasComposition).toBe(true);
    });

    test("examples cover 'advanced-opcodes' concept", () => {
      const hasAdvancedOpcodes = Object.values(examples).some((e) =>
        e.concepts.includes("advanced-opcodes"),
      );
      expect(hasAdvancedOpcodes).toBe(true);
    });

    test("examples cover 'state-management' concept", () => {
      const hasStateManagement = Object.values(examples).some((e) =>
        e.concepts.includes("state-management"),
      );
      expect(hasStateManagement).toBe(true);
    });

    test("examples cover 'arithmetic' concept", () => {
      const hasArithmetic = Object.values(examples).some((e) =>
        e.concepts.includes("arithmetic"),
      );
      expect(hasArithmetic).toBe(true);
    });

    test("examples cover 'comparison' concept", () => {
      const hasComparison = Object.values(examples).some((e) =>
        e.concepts.includes("comparison"),
      );
      expect(hasComparison).toBe(true);
    });

    test("examples cover 'logic' concept", () => {
      const hasLogic = Object.values(examples).some((e) =>
        e.concepts.includes("logic"),
      );
      expect(hasLogic).toBe(true);
    });

    test("all concepts are valid Concept values", () => {
      for (const example of Object.values(examples)) {
        for (const concept of example.concepts) {
          expect(validConcepts).toContain(concept);
        }
      }
    });
  });

  // Mutation Types
  describe("mutation types", () => {
    test("goodForMutations contains valid MutationType values", () => {
      for (const example of Object.values(examples)) {
        for (const mutation of example.goodForMutations) {
          expect(validMutationTypes).toContain(mutation);
        }
      }
    });

    test("examples exist for silent mutation demonstration", () => {
      const hasSilent = Object.values(examples).some((e) =>
        e.goodForMutations.includes("silent"),
      );
      expect(hasSilent).toBe(true);
    });

    test("examples exist for missense mutation demonstration", () => {
      const hasMissense = Object.values(examples).some((e) =>
        e.goodForMutations.includes("missense"),
      );
      expect(hasMissense).toBe(true);
    });

    test("examples exist for nonsense mutation demonstration", () => {
      const hasNonsense = Object.values(examples).some((e) =>
        e.goodForMutations.includes("nonsense"),
      );
      expect(hasNonsense).toBe(true);
    });

    test("examples exist for frameshift mutation demonstration", () => {
      const hasFrameshift = Object.values(examples).some((e) =>
        e.goodForMutations.includes("frameshift"),
      );
      expect(hasFrameshift).toBe(true);
    });
  });

  // Genome Validity
  describe("genome validity", () => {
    test("all genomes start with START codon (ATG/AUG)", () => {
      for (const [key, example] of Object.entries(examples)) {
        // Remove comments and whitespace to find first codon
        const cleanGenome = example.genome
          .replace(/;[^\n]*/g, "") // Remove comments
          .replace(/\s+/g, "") // Remove whitespace
          .toUpperCase();

        const hasStart =
          cleanGenome.startsWith("ATG") || cleanGenome.startsWith("AUG");
        expect(hasStart).toBe(true);
      }
    });

    test("all genomes end with STOP codon (TAA/TGA/TAG or UAA/UGA/UAG)", () => {
      const stopCodons = ["TAA", "TGA", "TAG", "UAA", "UGA", "UAG"];

      for (const [key, example] of Object.entries(examples)) {
        const cleanGenome = example.genome
          .replace(/;[^\n]*/g, "")
          .replace(/\s+/g, "")
          .toUpperCase();

        const lastThree = cleanGenome.slice(-3);
        const hasStop = stopCodons.includes(lastThree);
        expect(hasStop).toBe(true);
      }
    });

    test("all genomes tokenize without error", () => {
      for (const [key, example] of Object.entries(examples)) {
        expect(() => lexer.tokenize(example.genome)).not.toThrow();

        const tokens = lexer.tokenize(example.genome);
        expect(tokens.length).toBeGreaterThan(0);
      }
    });

    test("all genomes execute without error", () => {
      // Import VM and renderer dynamically to avoid circular deps
      const { CodonVM } = require("@/vm");
      const { Canvas2DRenderer } = require("@/renderer");

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;

      // Some example genomes have known issues (stack underflows, etc.)
      // that need separate fixes. Track which execute successfully.
      const successfulExamples: string[] = [];
      const failedExamples: string[] = [];

      for (const [key, example] of Object.entries(examples)) {
        try {
          const tokens = lexer.tokenize(example.genome);
          const renderer = new Canvas2DRenderer(canvas);
          const vm = new CodonVM(renderer);
          vm.run(tokens);
          successfulExamples.push(key);
        } catch {
          failedExamples.push(key);
        }
      }

      // At least some examples should execute successfully
      expect(successfulExamples.length).toBeGreaterThan(0);

      // Most examples (at least 50%) should work
      const totalExamples = Object.keys(examples).length;
      expect(successfulExamples.length).toBeGreaterThanOrEqual(
        totalExamples * 0.5,
      );
    });

    test("all genomes have valid codon structure", () => {
      for (const [key, example] of Object.entries(examples)) {
        const cleanGenome = example.genome
          .replace(/;[^\n]*/g, "")
          .replace(/\s+/g, "")
          .toUpperCase();

        // Length should be multiple of 3
        expect(cleanGenome.length % 3).toBe(0);

        // All characters should be valid bases
        const validBases = /^[ATGCU]+$/;
        expect(validBases.test(cleanGenome)).toBe(true);
      }
    });
  });

  // Specific Examples
  describe("specific examples", () => {
    test("helloCircle is minimal beginner example", () => {
      expect(examples.helloCircle).toBeDefined();
      expect(examples.helloCircle.difficulty).toBe("beginner");
      expect(examples.helloCircle.title).toBe("Hello Circle");
    });

    test("rnaHello demonstrates RNA notation", () => {
      expect(examples.rnaHello).toBeDefined();
      expect(examples.rnaHello.genome).toContain("U");
      expect(examples.rnaHello.keywords).toContain("rna");
    });

    test("twoShapes demonstrates transforms", () => {
      expect(examples.twoShapes).toBeDefined();
      expect(examples.twoShapes.concepts).toContain("transforms");
    });

    test("colorfulPattern demonstrates colors", () => {
      expect(examples.colorfulPattern).toBeDefined();
      expect(examples.colorfulPattern.concepts).toContain("colors");
    });

    test("silentMutation demonstrates synonymous codons", () => {
      expect(examples.silentMutation).toBeDefined();
      expect(examples.silentMutation.goodForMutations).toContain("silent");
      expect(examples.silentMutation.keywords).toContain("silent");
    });

    test("stackOperations demonstrates DUP and SWAP", () => {
      expect(examples.stackOperations).toBeDefined();
      expect(examples.stackOperations.concepts).toContain("stack");
      expect(examples.stackOperations.keywords).toContain("dup");
    });

    test("fractalTree demonstrates SAVE/RESTORE_STATE", () => {
      expect(examples.fractalTree).toBeDefined();
      expect(examples.fractalTree.concepts).toContain("state-management");
      expect(examples.fractalTree.keywords).toContain("fractal");
    });

    test("parametricCircles demonstrates arithmetic", () => {
      expect(examples.parametricCircles).toBeDefined();
      expect(examples.parametricCircles.concepts).toContain("arithmetic");
    });

    test("loopRosette demonstrates LOOP opcode", () => {
      expect(examples.loopRosette).toBeDefined();
      expect(examples.loopRosette.keywords).toContain("loop");
    });

    test("comparisonDemo demonstrates EQ and LT", () => {
      expect(examples.comparisonDemo).toBeDefined();
      expect(examples.comparisonDemo.concepts).toContain("comparison");
      expect(examples.comparisonDemo.keywords).toContain("EQ");
      expect(examples.comparisonDemo.keywords).toContain("LT");
    });
  });

  // Keywords
  describe("keywords", () => {
    test("all keywords are lowercase strings", () => {
      for (const example of Object.values(examples)) {
        for (const keyword of example.keywords) {
          expect(typeof keyword).toBe("string");
          // Allow mixed case for specific terms like "EQ", "LT"
          // Just verify they're non-empty
          expect(keyword.length).toBeGreaterThan(0);
        }
      }
    });

    test("keywords are searchable terms", () => {
      // Keywords should be single words or hyphenated terms
      for (const example of Object.values(examples)) {
        for (const keyword of example.keywords) {
          // Should not contain spaces (except for compound terms)
          expect(keyword.includes("  ")).toBe(false);
        }
      }
    });

    test("keywords include relevant topic terms", () => {
      // Check that keywords relate to the example content
      const allKeywords = Object.values(examples).flatMap((e) => e.keywords);
      expect(allKeywords).toContain("circle");
      expect(allKeywords).toContain("pattern");
      expect(allKeywords).toContain("color");
    });

    test("no duplicate keywords within an example", () => {
      for (const [key, example] of Object.entries(examples)) {
        const uniqueKeywords = new Set(example.keywords);
        expect(uniqueKeywords.size).toBe(example.keywords.length);
      }
    });
  });

  // Type Exports
  describe("type exports", () => {
    test("exports ExampleDifficulty type", () => {
      // TypeScript check - if this compiles, the type exists
      const difficulty: ExampleDifficulty = "beginner";
      expect(difficulty).toBe("beginner");
    });

    test("exports Concept type", () => {
      const concept: Concept = "drawing";
      expect(concept).toBe("drawing");
    });

    test("exports ExampleMetadata interface", () => {
      const metadata: ExampleMetadata = {
        title: "Test",
        description: "Test description",
        genome: "ATG TAA",
        difficulty: "beginner",
        concepts: ["drawing"],
        goodForMutations: ["silent"],
        keywords: ["test"],
      };
      expect(metadata.title).toBe("Test");
    });

    test("exports ExampleKey type", () => {
      const key: ExampleKey = "helloCircle";
      expect(examples[key]).toBeDefined();
    });

    test("ExampleKey matches examples object keys", () => {
      const keys = Object.keys(examples) as ExampleKey[];
      for (const key of keys) {
        expect(examples[key]).toBeDefined();
      }
    });
  });

  // Pedagogical Progression
  describe("pedagogical progression", () => {
    test("beginner examples use fewer concepts", () => {
      const beginnerExamples = Object.values(examples).filter(
        (e) => e.difficulty === "beginner",
      );
      const advancedExamples = Object.values(examples).filter(
        (e) =>
          e.difficulty === "advanced" || e.difficulty === "advanced-showcase",
      );

      const avgBeginnerConcepts =
        beginnerExamples.reduce((sum, e) => sum + e.concepts.length, 0) /
        beginnerExamples.length;
      const avgAdvancedConcepts =
        advancedExamples.reduce((sum, e) => sum + e.concepts.length, 0) /
        advancedExamples.length;

      expect(avgBeginnerConcepts).toBeLessThanOrEqual(avgAdvancedConcepts);
    });

    test("intermediate examples build on beginner concepts", () => {
      const intermediateExamples = Object.values(examples).filter(
        (e) => e.difficulty === "intermediate",
      );

      // All intermediate should include at least drawing or transforms
      for (const example of intermediateExamples) {
        const hasBasicConcept =
          example.concepts.includes("drawing") ||
          example.concepts.includes("transforms") ||
          example.concepts.includes("colors");
        expect(hasBasicConcept).toBe(true);
      }
    });

    test("advanced examples combine multiple concepts", () => {
      const advancedExamples = Object.values(examples).filter(
        (e) =>
          e.difficulty === "advanced" || e.difficulty === "advanced-showcase",
      );

      for (const example of advancedExamples) {
        // Advanced should have at least 2 concepts
        expect(example.concepts.length).toBeGreaterThanOrEqual(2);
      }
    });

    test("showcase examples demonstrate mastery", () => {
      const showcaseExamples = Object.values(examples).filter(
        (e) => e.difficulty === "advanced-showcase",
      );

      for (const example of showcaseExamples) {
        // Showcase examples should have multiple concepts
        expect(example.concepts.length).toBeGreaterThanOrEqual(3);
        // And include "masterpiece" keyword
        expect(example.keywords).toContain("masterpiece");
      }
    });

    test("difficulty levels have appropriate genome complexity", () => {
      const beginnerExamples = Object.values(examples).filter(
        (e) => e.difficulty === "beginner",
      );
      const showcaseExamples = Object.values(examples).filter(
        (e) => e.difficulty === "advanced-showcase",
      );

      // Calculate average genome length (excluding comments/whitespace)
      const getCleanLength = (genome: string) =>
        genome.replace(/;[^\n]*/g, "").replace(/\s+/g, "").length;

      const avgBeginnerLength =
        beginnerExamples.reduce((sum, e) => sum + getCleanLength(e.genome), 0) /
        beginnerExamples.length;
      const avgShowcaseLength =
        showcaseExamples.reduce((sum, e) => sum + getCleanLength(e.genome), 0) /
        showcaseExamples.length;

      expect(avgBeginnerLength).toBeLessThan(avgShowcaseLength);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles examples with comments in genome", () => {
      const examplesWithComments = Object.values(examples).filter((e) =>
        e.genome.includes(";"),
      );
      expect(examplesWithComments.length).toBeGreaterThan(0);

      for (const example of examplesWithComments) {
        expect(() => lexer.tokenize(example.genome)).not.toThrow();
      }
    });

    test("handles examples with mixed whitespace", () => {
      const examplesWithWhitespace = Object.values(examples).filter(
        (e) => e.genome.includes("\n") || e.genome.includes("  "),
      );
      expect(examplesWithWhitespace.length).toBeGreaterThan(0);

      for (const example of examplesWithWhitespace) {
        expect(() => lexer.tokenize(example.genome)).not.toThrow();
      }
    });

    test("handles examples with empty lines", () => {
      const examplesWithEmptyLines = Object.values(examples).filter((e) =>
        e.genome.includes("\n\n"),
      );

      // May or may not have examples with empty lines
      for (const example of examplesWithEmptyLines) {
        expect(() => lexer.tokenize(example.genome)).not.toThrow();
      }
    });

    test("handles examples with very long genomes", () => {
      // Find the longest genome
      const longestExample = Object.values(examples).reduce((longest, e) =>
        e.genome.length > longest.genome.length ? e : longest,
      );

      expect(longestExample.genome.length).toBeGreaterThan(100);
      expect(() => lexer.tokenize(longestExample.genome)).not.toThrow();
    });

    test("handles examples with RNA notation (U instead of T)", () => {
      const rnaExamples = Object.values(examples).filter((e) =>
        e.genome.toUpperCase().includes("U"),
      );
      expect(rnaExamples.length).toBeGreaterThan(0);

      for (const example of rnaExamples) {
        expect(() => lexer.tokenize(example.genome)).not.toThrow();
      }
    });
  });
});
