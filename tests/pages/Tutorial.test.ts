/**
 * Tests for Tutorial page
 *
 * Tests lesson data, validation logic, and progress tracking.
 */

import { describe, expect, test } from "bun:test";
import { CodonLexer } from "@/core/lexer";
import {
  getLessonById,
  getLessonsByModule,
  moduleNames,
  type TutorialLesson,
  tutorialLessons,
} from "@/data/tutorial-lessons";

describe("Tutorial", () => {
  describe("lesson data", () => {
    test("has 10 lessons", () => {
      expect(tutorialLessons.length).toBe(10);
    });

    test("has 3 modules", () => {
      const modules = new Set(tutorialLessons.map((l) => l.module));
      expect(modules.size).toBe(3);
    });

    test("module names are defined", () => {
      expect(moduleNames[1]).toBe("First Steps");
      expect(moduleNames[2]).toBe("Mutations");
      expect(moduleNames[3]).toBe("Advanced Techniques");
    });

    test("each lesson has required fields", () => {
      for (const lesson of tutorialLessons) {
        expect(lesson.id).toBeDefined();
        expect(lesson.module).toBeGreaterThan(0);
        expect(lesson.lessonNumber).toBeGreaterThan(0);
        expect(lesson.title).toBeDefined();
        expect(lesson.description).toBeDefined();
        expect(lesson.instructions.length).toBeGreaterThan(0);
        expect(lesson.starterCode).toBeDefined();
        expect(lesson.hints.length).toBeGreaterThan(0);
        expect(lesson.learningObjectives.length).toBeGreaterThan(0);
      }
    });

    test("lesson IDs are unique", () => {
      const ids = tutorialLessons.map((l) => l.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test("nextLesson references are valid (or undefined for last)", () => {
      const ids = new Set(tutorialLessons.map((l) => l.id));
      for (const lesson of tutorialLessons) {
        if (lesson.nextLesson !== undefined) {
          expect(ids.has(lesson.nextLesson)).toBe(true);
        }
      }
    });

    test("last lesson has no nextLesson", () => {
      const lastLesson = tutorialLessons[tutorialLessons.length - 1];
      expect(lastLesson.nextLesson).toBeUndefined();
    });
  });

  describe("getLessonById", () => {
    test("returns lesson for valid ID", () => {
      const lesson = getLessonById("basics-1");
      expect(lesson).toBeDefined();
      expect(lesson?.title).toBe("Hello Circle - Your First Program");
    });

    test("returns undefined for invalid ID", () => {
      const lesson = getLessonById("nonexistent");
      expect(lesson).toBeUndefined();
    });
  });

  describe("getLessonsByModule", () => {
    test("returns correct lessons for module 1", () => {
      const lessons = getLessonsByModule(1);
      expect(lessons.length).toBe(3);
      expect(lessons.every((l) => l.module === 1)).toBe(true);
    });

    test("returns correct lessons for module 2", () => {
      const lessons = getLessonsByModule(2);
      expect(lessons.length).toBe(4);
      expect(lessons.every((l) => l.module === 2)).toBe(true);
    });

    test("returns correct lessons for module 3", () => {
      const lessons = getLessonsByModule(3);
      expect(lessons.length).toBe(3);
      expect(lessons.every((l) => l.module === 3)).toBe(true);
    });

    test("returns empty for invalid module", () => {
      const lessons = getLessonsByModule(99);
      expect(lessons.length).toBe(0);
    });
  });

  describe("validation logic", () => {
    const lexer = new CodonLexer();

    function checkRequiredCodons(
      code: string,
      requiredCodons: readonly string[] | undefined,
    ): string[] {
      if (!requiredCodons) return [];
      const errors: string[] = [];
      const codeUpper = code.toUpperCase();
      for (const required of requiredCodons) {
        if (!codeUpper.includes(required)) {
          errors.push(`Missing required codon: ${required}`);
        }
      }
      return errors;
    }

    function checkMinInstructions(
      tokenCount: number,
      minInstructions: number | undefined,
    ): string[] {
      if (minInstructions && tokenCount < minInstructions) {
        return [`Need at least ${minInstructions} instructions`];
      }
      return [];
    }

    function checkCustomValidator(
      code: string,
      validator: ((code: string) => boolean) | undefined,
    ): string[] {
      if (validator && !validator(code)) {
        return ["Custom validation failed"];
      }
      return [];
    }

    function validateCode(
      lesson: TutorialLesson,
      code: string,
    ): { passed: boolean; errors: string[] } {
      try {
        const tokens = lexer.tokenize(code);
        const errors = [
          ...checkRequiredCodons(code, lesson.validation.requiredCodons),
          ...checkMinInstructions(
            tokens.length,
            lesson.validation.minInstructions,
          ),
          ...checkCustomValidator(code, lesson.validation.customValidator),
        ];
        return { passed: errors.length === 0, errors };
      } catch (error) {
        return { passed: false, errors: [`Parse error: ${error}`] };
      }
    }

    test("basics-1: valid solution passes", () => {
      const lesson = getLessonById("basics-1")!;
      const result = validateCode(lesson, "ATG GAA CCC GGA TAA");
      expect(result.passed).toBe(true);
    });

    test("basics-1: missing START fails", () => {
      const lesson = getLessonById("basics-1")!;
      const result = validateCode(lesson, "GAA CCC GGA TAA");
      expect(result.passed).toBe(false);
      expect(result.errors.some((e) => e.includes("ATG"))).toBe(true);
    });

    test("basics-1: missing CIRCLE fails", () => {
      const lesson = getLessonById("basics-1")!;
      const result = validateCode(lesson, "ATG GAA CCC TAA");
      expect(result.passed).toBe(false);
      expect(result.errors.some((e) => e.includes("GGA"))).toBe(true);
    });

    test("mutations-1: silent mutation passes", () => {
      const lesson = getLessonById("mutations-1")!;
      // GGC is a valid circle codon (silent mutation from GGA)
      const result = validateCode(lesson, "ATG GAA AAT GGC TAA");
      expect(result.passed).toBe(true);
    });

    test("mutations-3: nonsense mutation requires 2 stops", () => {
      const lesson = getLessonById("mutations-3")!;
      // One stop (original)
      const result1 = validateCode(lesson, "ATG GAA AAT GGA TAA");
      expect(result1.passed).toBe(false);

      // Two stops (nonsense mutation)
      const result2 = validateCode(lesson, "ATG GAA AAT GGA TAG GAA CCC TAA");
      expect(result2.passed).toBe(true);
    });

    test("mutations-4: frameshift custom validator checks non-multiple-of-3", () => {
      const lesson = getLessonById("mutations-4")!;
      expect(lesson.validation.customValidator).toBeDefined();

      // Normal code (multiple of 3) should fail
      const normalCode = "ATG GAA AAT GGA TAA";
      expect(lesson.validation.customValidator!(normalCode)).toBe(false);

      // Frameshift (not multiple of 3) should pass
      const frameshiftCode = "ATG GA AAT GGA TAA"; // 14 non-space chars
      expect(lesson.validation.customValidator!(frameshiftCode)).toBe(true);
    });

    test("advanced-3: creative challenge requires shapes, color, transform", () => {
      const lesson = getLessonById("advanced-3")!;

      // Missing requirements (only 1 shape, no color, no transform)
      const minimal = "ATG GAA AAT GGA TAA";
      const result1 = validateCode(lesson, minimal);
      expect(result1.passed).toBe(false);

      // Has 3+ shapes (GGA, GGC, GGT), color (TTA), and transform (ACA)
      // Must have minInstructions >= 15 tokens too
      const full =
        "ATG GAA AAT GGA GAA AAT GGC GAA AAT GGT GAA AAA GAA AAA GAA AAA TTA GAA AAA ACA TAA";
      const result2 = validateCode(lesson, full);
      expect(result2.passed).toBe(true);
    });
  });

  describe("starter code", () => {
    test("all starter codes are parseable", () => {
      const lexer = new CodonLexer();
      for (const lesson of tutorialLessons) {
        expect(() => lexer.tokenize(lesson.starterCode)).not.toThrow();
      }
    });

    test("starter codes contain ATG and TAA", () => {
      for (const lesson of tutorialLessons) {
        const upper = lesson.starterCode.toUpperCase();
        expect(upper.includes("ATG")).toBe(true);
        expect(upper.includes("TAA")).toBe(true);
      }
    });
  });

  describe("hints", () => {
    test("each lesson has 3 hints", () => {
      for (const lesson of tutorialLessons) {
        expect(lesson.hints.length).toBe(3);
      }
    });

    test("hints are non-empty strings", () => {
      for (const lesson of tutorialLessons) {
        for (const hint of lesson.hints) {
          expect(typeof hint).toBe("string");
          expect(hint.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
