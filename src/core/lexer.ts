/**
 * @fileoverview CodonCanvas genome lexer
 *
 * Tokenizes DNA/RNA-like triplet syntax into executable codon tokens.
 * Supports both DNA (T) and RNA (U) notation with automatic normalization.
 *
 * **Parsing Rules:**
 * - Valid bases: A, C, G, T, U (U is normalized to T)
 * - Whitespace is ignored (used for formatting)
 * - Comments start with `;` and extend to end of line
 * - Source length must be divisible by 3 (complete codons only)
 *
 * @module core/lexer
 */

import {
  BASES,
  type Codon,
  type CodonToken,
  type GenomeMetadata,
  type ParseError,
  type ValueMode,
} from "@/types";

/** Valid base letters for lexer validation, derived from BASES */
const VALID_BASES = new Set<string>(Object.keys(BASES));

/**
 * Strip comment from a line (everything after `;`).
 * @internal
 */
function getCodeContent(line: string): string {
  const commentIdx = line.indexOf(";");
  return commentIdx >= 0 ? line.slice(0, commentIdx) : line;
}

/**
 * Result of parsing a genome source, including tokens and metadata.
 */
export interface ParseResult {
  /** Parsed codon tokens */
  tokens: CodonToken[];
  /** Extracted genome metadata from directives */
  metadata: GenomeMetadata;
}

/**
 * Default genome metadata when no directives are specified.
 *
 * Default is "centered" mode for bidirectional positioning.
 * Use `; @mode: forward-only` for legacy compatibility with older genomes.
 */
export const DEFAULT_GENOME_METADATA: GenomeMetadata = {
  mode: "centered",
};

/**
 * Maps user-friendly mode names (used in genome files) to internal ValueMode.
 *
 * User-facing names in genome files:
 * - `bidirectional` → "centered" (can move in any direction)
 * - `forward-only` → "forward" (legacy, positive movement only)
 */
const MODE_ALIASES: Record<string, ValueMode> = {
  // User-friendly names
  bidirectional: "centered",
  "forward-only": "forward",
  // Also accept internal names for advanced users
  centered: "centered",
  forward: "forward",
};

/**
 * Lexer interface for CodonCanvas genome parsing.
 *
 * Responsible for tokenizing DNA/RNA triplets and validating genome structure.
 * Implementations should normalize RNA (U) to DNA (T) notation.
 */
export interface Lexer {
  /**
   * Tokenize source genome into codons.
   *
   * @param source - Raw genome string containing DNA/RNA bases (A/C/G/T/U)
   *   with optional whitespace and comments (`;` to end of line)
   * @returns Array of codon tokens with position and line information
   * @throws {Error} If invalid characters found (non-ACGTU after stripping whitespace)
   * @throws {Error} If source length not divisible by 3 (incomplete codon)
   */
  tokenize(source: string): CodonToken[];

  /**
   * Parse source genome into tokens and extract metadata directives.
   *
   * Directives are special comments that configure genome execution:
   * - `; @mode: signed` - Enable signed value interpretation
   * - `; @mode: unsigned` - Unsigned values (default)
   *
   * @param source - Raw genome string with optional directives
   * @returns Parsed tokens and extracted metadata
   * @throws {Error} If invalid characters or incomplete codons
   *
   * @example
   * ```typescript
   * const lexer = new CodonLexer();
   * const { tokens, metadata } = lexer.parse(`
   *   ; @mode: signed
   *   ATG GAA GGG ACA TAA
   * `);
   * // metadata.mode === "signed"
   * ```
   */
  parse(source: string): ParseResult;

  /**
   * Validate reading frame alignment.
   *
   * Checks for whitespace breaks within triplets that would disrupt the reading frame.
   * Does NOT throw; returns warnings for formatting issues.
   *
   * @param source - Raw genome string to validate
   * @returns Array of frame alignment warnings (never errors)
   */
  validateFrame(source: string): ParseError[];

  /**
   * Validate structural integrity of tokenized genome.
   *
   * Checks for:
   * - START codon (ATG) at beginning
   * - STOP codon (TAA/TAG/TGA) at end
   * - Unknown/unmapped codons
   * - Code after STOP (unreachable)
   *
   * @param tokens - Array of codon tokens to validate
   * @returns Array of structural errors and warnings
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
  private readonly validBases = VALID_BASES;

  /**
   * Tokenize source genome into codons.
   *
   * Strips comments (`;` to EOL), removes whitespace, validates base characters,
   * and chunks into triplets. Tracks line numbers for error reporting.
   * Supports both DNA (T) and RNA (U) notation - U is normalized to T internally.
   *
   * @param source - Raw genome string (supports A/C/G/T/U, whitespace, `;` comments)
   * @returns Array of codon tokens with position metadata
   * @throws {Error} If invalid characters found (message includes line/column)
   * @throws {Error} If cleaned source length not divisible by 3
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
      if (line === undefined) continue;
      this.processTokenizeLine(line, lineIdx, (char, pos) => {
        cleanedSource += char;
        positionMap.push(pos);
      });
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
      if (line === undefined) continue;
      this.validateLineFrame(line, lineIdx, errors);
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

    this.checkStartCodon(tokens, errors);
    this.checkStopCodons(tokens, errors);

    return errors;
  }

  private processTokenizeLine(
    line: string,
    lineIdx: number,
    onBase: (char: string, pos: { line: number; column: number }) => void,
  ) {
    const codeLine = getCodeContent(line);

    for (let charIdx = 0; charIdx < codeLine.length; charIdx++) {
      const char = codeLine[charIdx];
      if (char === undefined) continue;
      if (this.validBases.has(char)) {
        // Normalize U→T (RNA to DNA notation)
        const normalizedChar = char === "U" ? "T" : char;
        onBase(normalizedChar, { line: lineIdx + 1, column: charIdx });
      } else if (char.trim() !== "") {
        throw new Error(
          `Invalid character '${char}' at line ${
            lineIdx + 1
          }, column ${charIdx}`,
        );
      }
    }
  }

  /**
   * Parse source genome into tokens and extract metadata directives.
   *
   * @param source - Raw genome string with optional directives
   * @returns Parsed tokens and extracted metadata
   */
  parse(source: string): ParseResult {
    const tokens = this.tokenize(source);
    const metadata = this.extractDirectives(source);
    return { tokens, metadata };
  }

  /**
   * Extract metadata directives from genome source comments.
   *
   * Supported directives:
   * - `; @mode: bidirectional` - Centered mode, value 32 = no movement (default)
   * - `; @mode: forward-only` - Legacy mode, value 0 = no movement
   *
   * @param source - Raw genome string
   * @returns Extracted metadata with defaults for unspecified values
   */
  private extractDirectives(source: string): GenomeMetadata {
    const metadata: GenomeMetadata = { ...DEFAULT_GENOME_METADATA };
    const lines = source.split("\n");

    for (const line of lines) {
      const commentIdx = line.indexOf(";");
      if (commentIdx < 0) continue;

      const comment = line.slice(commentIdx + 1).trim();

      // Parse @mode directive - accepts user-friendly and internal names
      const modeMatch = comment.match(
        /^@mode:\s*(bidirectional|forward-only|centered|forward)$/i,
      );
      if (modeMatch) {
        const userMode = modeMatch[1].toLowerCase();
        metadata.mode = MODE_ALIASES[userMode] ?? "centered";
      }
    }

    return metadata;
  }

  private validateLineFrame(
    line: string,
    lineIdx: number,
    errors: ParseError[],
  ) {
    const codeLine = getCodeContent(line);
    let baseCount = 0;

    for (let charIdx = 0; charIdx < codeLine.length; charIdx++) {
      const char = codeLine[charIdx];
      if (char === undefined) continue;
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

  private checkStartCodon(tokens: CodonToken[], errors: ParseError[]) {
    const firstToken = tokens[0];
    if (firstToken && firstToken.text !== "ATG") {
      errors.push({
        message: "Program should begin with START codon (ATG)",
        position: 0,
        severity: "error",
        fix: "Add ATG at the beginning",
      });
    }
  }

  private checkStopCodons(tokens: CodonToken[], errors: ParseError[]) {
    const stopCodons = new Set(["TAA", "TAG", "TGA"]);
    let firstStopIdx = -1;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!token) continue;

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
    const lastToken = tokens[tokens.length - 1];
    if (lastToken && !stopCodons.has(lastToken.text)) {
      errors.push({
        message: "Program should end with STOP codon (TAA, TAG, or TGA)",
        position: lastToken.position,
        severity: "warning",
        fix: "Add TAA at the end",
      });
    }
  }
}
