/**
 * Genome validation utilities
 *
 * Pure functions for validating genome strings.
 * No React dependencies - can be used anywhere.
 */

import type { CodonLexer } from "@/core/lexer";
import type { CodonToken, ParseError } from "@/types";

/** Validation result from genome analysis */
export interface GenomeValidation {
  /** Whether the genome is structurally valid */
  isValid: boolean;
  /** Tokenized codons (empty if tokenization failed) */
  tokens: CodonToken[];
  /** Parse/structure errors */
  errors: ParseError[];
  /** Frame alignment warnings */
  warnings: ParseError[];
  /** Error message if tokenization itself failed */
  tokenizeError: string | null;
}

/** Create empty validation state */
export function createEmptyValidation(): GenomeValidation {
  return {
    isValid: false,
    tokens: [],
    errors: [],
    warnings: [],
    tokenizeError: null,
  };
}

/**
 * Validate a genome string using the provided lexer.
 *
 * @param genome - The genome string to validate
 * @param lexer - CodonLexer instance to use for tokenization
 * @returns Validation result with tokens, errors, and warnings
 *
 * @example
 * ```ts
 * const lexer = new CodonLexer();
 * const result = validateGenome("ATG GGA TAA", lexer);
 * if (result.isValid) {
 *   console.log("Valid genome with", result.tokens.length, "tokens");
 * } else {
 *   console.error("Errors:", result.errors);
 * }
 * ```
 */
export function validateGenome(
  genome: string,
  lexer: CodonLexer,
): GenomeValidation {
  try {
    const tokens = lexer.tokenize(genome);
    const structureErrors = lexer.validateStructure(tokens);
    const frameWarnings = lexer.validateFrame(genome);

    const errors = structureErrors.filter((e) => e.severity === "error");
    const warnings = [
      ...structureErrors.filter((e) => e.severity === "warning"),
      ...frameWarnings,
    ];

    return {
      isValid: errors.length === 0,
      tokens,
      errors,
      warnings,
      tokenizeError: null,
    };
  } catch (err) {
    return {
      isValid: false,
      tokens: [],
      errors: [],
      warnings: [],
      tokenizeError: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
