import { CodonLexer } from "@/core/lexer";
import type { TutorialLesson } from "@/data/tutorial-lessons";
import type { ValidationResult } from "./types";

export function validateCode(
  lesson: TutorialLesson,
  code: string,
): ValidationResult {
  const errors: string[] = [];

  try {
    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(code);

    // Check required codons
    if (lesson.validation.requiredCodons) {
      const codeUpper = code.toUpperCase();
      for (const required of lesson.validation.requiredCodons) {
        if (!codeUpper.includes(required)) {
          errors.push(`Missing required codon: ${required}`);
        }
      }
    }

    // Check minimum instructions
    if (
      lesson.validation.minInstructions &&
      tokens.length < lesson.validation.minInstructions
    ) {
      errors.push(
        `Need at least ${lesson.validation.minInstructions} instructions (you have ${tokens.length})`,
      );
    }

    // Custom validator
    if (lesson.validation.customValidator) {
      if (!lesson.validation.customValidator(code)) {
        errors.push("Does not meet the lesson requirements");
      }
    }
  } catch (error) {
    errors.push(
      `Parse error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return { passed: errors.length === 0, errors };
}
