/**
 * Tests for tutorial code validation
 */

import { describe, expect, test } from "bun:test";
import { validateCode } from "@/components/tutorial/validation";
import type { TutorialLesson } from "@/data/tutorial-lessons";

function createMockLesson(
  validation: TutorialLesson["validation"],
): TutorialLesson {
  return {
    id: "test-lesson",
    module: 1,
    lessonNumber: 1,
    title: "Test Lesson",
    description: "Test",
    instructions: [],
    starterCode: "",
    hints: [],
    validation,
    learningObjectives: [],
  };
}

describe("validateCode", () => {
  describe("requiredCodons", () => {
    test("passes when all required codons are present", () => {
      const lesson = createMockLesson({
        requiredCodons: ["ATG", "TAA"],
      });

      const result = validateCode(lesson, "ATG GAA CCC TAA");

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("fails when required codon is missing", () => {
      const lesson = createMockLesson({
        requiredCodons: ["ATG", "GGA", "TAA"],
      });

      const result = validateCode(lesson, "ATG TAA");

      expect(result.passed).toBe(false);
      expect(result.errors).toContain("Missing required codon: GGA");
    });

    test("matches codons case-insensitively when requirement is lowercase", () => {
      const lesson = createMockLesson({
        requiredCodons: ["atg", "taa"],
      });

      const result = validateCode(lesson, "ATG GAA TAA");

      expect(result.passed).toBe(true);
    });

    test("matches codons case-insensitively when requirement is mixed case", () => {
      const lesson = createMockLesson({
        requiredCodons: ["Atg", "TaA"],
      });

      const result = validateCode(lesson, "ATG GAA TAA");

      expect(result.passed).toBe(true);
    });

    test("lowercase code fails at lexer level (not validation)", () => {
      // The lexer only accepts uppercase codons
      // Lowercase input causes a parse error before validation runs
      const lesson = createMockLesson({
        requiredCodons: ["ATG", "TAA"],
      });

      const result = validateCode(lesson, "atg gaa taa");

      expect(result.passed).toBe(false);
      expect(result.errors[0]).toContain("Parse error");
    });
  });

  describe("minInstructions", () => {
    test("passes when instruction count meets minimum", () => {
      const lesson = createMockLesson({
        minInstructions: 3,
      });

      const result = validateCode(lesson, "ATG GAA CCC TAA");

      expect(result.passed).toBe(true);
    });

    test("fails when instruction count is below minimum", () => {
      const lesson = createMockLesson({
        minInstructions: 5,
      });

      const result = validateCode(lesson, "ATG TAA");

      expect(result.passed).toBe(false);
      expect(result.errors[0]).toContain("Need at least 5 instructions");
    });
  });

  describe("customValidator", () => {
    test("passes when custom validator returns true", () => {
      const lesson = createMockLesson({
        customValidator: (code) => code.includes("GGA"),
      });

      const result = validateCode(lesson, "ATG GGA TAA");

      expect(result.passed).toBe(true);
    });

    test("fails when custom validator returns false", () => {
      const lesson = createMockLesson({
        customValidator: () => false,
      });

      const result = validateCode(lesson, "ATG TAA");

      expect(result.passed).toBe(false);
      expect(result.errors).toContain("Does not meet the lesson requirements");
    });
  });

  describe("parse errors", () => {
    test("handles lexer errors gracefully", () => {
      const lesson = createMockLesson({});

      // Invalid codon that lexer won't recognize
      const result = validateCode(lesson, "ATG XXX TAA");

      expect(result.passed).toBe(false);
      expect(result.errors[0]).toContain("Parse error");
    });
  });

  describe("empty validation", () => {
    test("passes with no validation requirements", () => {
      const lesson = createMockLesson({});

      const result = validateCode(lesson, "ATG TAA");

      expect(result.passed).toBe(true);
    });
  });
});
