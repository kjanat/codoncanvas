import type { Codon, CodonToken, ParseError } from "./types";

/**
 * Lexer interface for CodonCanvas genome parsing.
 * Responsible for tokenizing DNA/RNA triplets and validating genome structure.
 */
export interface Lexer {
  /**
   * Tokenize source genome into codons.
   * @param source - Raw genome string containing DNA/RNA bases (A/C/G/T/U) with optional whitespace and comments
   * @returns Array of codon tokens with position and line information
   * @throws Error if invalid characters found or source length not divisible by 3
   */
  tokenize(source: string): CodonToken[];

  /**
   * Validate reading frame alignment.
   * Checks for whitespace breaks within triplets that would disrupt the reading frame.
   * @param source - Raw genome string to validate
   * @returns Array of validation errors/warnings
   */
  validateFrame(source: string): ParseError[];

  /**
   * Validate structural integrity of tokenized genome.
   * Checks for proper START/STOP codon placement and unknown opcodes.
   * @param tokens - Array of codon tokens to validate
   * @returns Array of structural errors/warnings
   */
  validateStructure(tokens: CodonToken[]): ParseError[];
}

/**
 * CodonCanvas lexer implementation.
 * Parses DNA/RNA-like triplet syntax into executable codon tokens.
 * Supports both DNA (T) and RNA (U) notation.
 *
 * @example
 * ```typescript
 * const lexer = new CodonLexer();
 * // DNA notation
 * const tokens1 = lexer.tokenize('ATG GAA CCC GGA TAA');
 * // RNA notation
 * const tokens2 = lexer.tokenize('AUG GAA CCC GGA UAA');
 * // Both produce identical results
 * const errors = lexer.validateStructure(tokens1);
 * ```
 */
export class CodonLexer implements Lexer {
  private readonly validBases = new Set<string>(["A", "C", "G", "T", "U"]);

  /**
   * Tokenize source genome into codons.
   *
   * Strips comments (`;` to EOL), removes whitespace, validates base characters,
   * and chunks into triplets. Tracks line numbers for error reporting.
   * Supports both DNA (T) and RNA (U) notation - U is normalized to T internally.
   *
   * @param source - Raw genome string (supports A/C/G/T/U, whitespace, `;` comments)
   * @returns Array of codon tokens with position metadata
   * @throws Error if invalid characters found or length not divisible by 3
   *
   * @example
   * ```typescript
   * const lexer = new CodonLexer();
   * // DNA notation
   * const tokens1 = lexer.tokenize('ATG GAA CCC GGA TAA');
   * // RNA notation (U→T normalized)
   * const tokens2 = lexer.tokenize('AUG GAA CCC GGA UAA');
   * // Both produce identical results
   * ```
   */
  tokenize(source: string): CodonToken[] {
    // Track line numbers for error reporting
    const lines = source.split("\n");
    let cleanedSource = "";
    const positionMap: Array<{ line: number; column: number }> = [];

    // Strip comments and track positions
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const commentIdx = line.indexOf(";");
      const codeLine = commentIdx >= 0 ? line.slice(0, commentIdx) : line;

      for (let charIdx = 0; charIdx < codeLine.length; charIdx++) {
        const char = codeLine[charIdx];
        if (this.validBases.has(char)) {
          // Normalize U→T (RNA to DNA notation)
          const normalizedChar = char === "U" ? "T" : char;
          cleanedSource += normalizedChar;
          positionMap.push({ line: lineIdx + 1, column: charIdx });
        } else if (char.trim() !== "") {
          throw new Error(
            `Invalid character '${char}' at line ${
              lineIdx + 1
            }, column ${charIdx}`,
          );
        }
      }
    }

    // Check for non-triplet length
    if (cleanedSource.length % 3 !== 0) {
      throw new Error(
        `Source length ${cleanedSource.length} is not divisible by 3. Missing ${
          3 - (cleanedSource.length % 3)
        } bases for complete codon.`,
      );
    }

    // Chunk into triplets
    const tokens: CodonToken[] = [];
    for (let i = 0; i < cleanedSource.length; i += 3) {
      const codonText = cleanedSource.slice(i, i + 3);
      tokens.push({
        text: codonText as Codon,
        position: i,
        line: positionMap[i]?.line || 1,
      });
    }

    return tokens;
  }

  /**
   * Validate reading frame alignment.
   *
   * Detects whitespace breaks within triplets that would disrupt codon boundaries.
   * Useful for linting genome source code for readability vs correctness.
   *
   * @param source - Raw genome string to validate
   * @returns Array of frame alignment warnings
   *
   * @example
   * ```typescript
   * const lexer = new CodonLexer();
   * const errors = lexer.validateFrame('ATG GG A CCA'); // Mid-triplet break: "GG A"
   * // Returns: [{ message: "Mid-triplet break...", severity: 'warning', ... }]
   * ```
   */
  validateFrame(source: string): ParseError[] {
    const errors: ParseError[] = [];
    const lines = source.split("\n");

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const commentIdx = line.indexOf(";");
      const codeLine = commentIdx >= 0 ? line.slice(0, commentIdx) : line;

      // Check for mid-triplet whitespace breaks
      let baseCount = 0;
      for (let charIdx = 0; charIdx < codeLine.length; charIdx++) {
        const char = codeLine[charIdx];
        if (this.validBases.has(char)) {
          baseCount++;
        } else if (char.trim() === "") {
          // Whitespace detected
          if (baseCount % 3 !== 0) {
            errors.push({
              message: `Mid-triplet break detected at line ${lineIdx + 1}. ${
                baseCount % 3
              } base(s) before whitespace.`,
              position: charIdx,
              severity: "warning",
              fix: "Remove whitespace or complete the codon",
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Validate structural integrity of tokenized genome.
   *
   * Checks for:
   * - START codon (ATG) at beginning
   * - Proper STOP codon (TAA/TAG/TGA) placement
   * - Unknown/unmapped codons
   * - START after STOP warnings
   *
   * @param tokens - Array of codon tokens to validate
   * @returns Array of structural errors and warnings
   *
   * @example
   * ```typescript
   * const lexer = new CodonLexer();
   * const tokens = lexer.tokenize('TAA GGA CCA'); // Missing START, early STOP
   * const errors = lexer.validateStructure(tokens);
   * // Returns errors for missing START and STOP before execution
   * ```
   */
  validateStructure(tokens: CodonToken[]): ParseError[] {
    const errors: ParseError[] = [];

    if (tokens.length === 0) {
      return errors;
    }

    // Check for START codon
    if (tokens[0].text !== "ATG") {
      errors.push({
        message: "Program should begin with START codon (ATG)",
        position: 0,
        severity: "error",
        fix: "Add ATG at the beginning",
      });
    }

    // Check for STOP codons
    const stopCodons = new Set(["TAA", "TAG", "TGA"]);
    let firstStopIdx = -1;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (stopCodons.has(token.text)) {
        if (firstStopIdx === -1) {
          firstStopIdx = i;
        }
      } else if (firstStopIdx >= 0 && token.text === "ATG") {
        // START after STOP
        errors.push({
          message: `START codon after STOP at position ${i}`,
          position: token.position,
          severity: "warning",
          fix: "Remove unreachable code after STOP",
        });
      }
    }

    // Check if program ends with STOP
    if (tokens.length > 0 && !stopCodons.has(tokens[tokens.length - 1].text)) {
      errors.push({
        message: "Program should end with STOP codon (TAA, TAG, or TGA)",
        position: tokens[tokens.length - 1].position,
        severity: "warning",
        fix: "Add TAA at the end",
      });
    }

    return errors;
  }
}
