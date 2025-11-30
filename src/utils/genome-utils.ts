/**
 * Shared genome string manipulation utilities.
 * Used by mutations.ts, assessment-engine.ts, and other genome processing code.
 */

import { decodeCodonValue } from "@/types/genetics";

// ============ Types ============

/**
 * Options for cleanGenome function.
 */
export interface CleanGenomeOptions {
  /** Normalize to uppercase (default: false) */
  uppercase?: boolean;
}

/**
 * A parsed line from a genome file, preserving structure and comments.
 */
export interface GenomeLine {
  /** 1-based line number */
  lineNumber: number;
  /** Codons found on this line (uppercase) */
  codons: string[];
  /** Comment text (without leading ;) or null if no comment */
  comment: string | null;
  /** Original raw line text */
  raw: string;
}

/**
 * A numeric literal found in genome code (codon following a PUSH opcode).
 */
export interface NumericLiteral {
  /** Index in the codons array */
  index: number;
  /** The codon string */
  codon: string;
  /** Decoded numeric value (0-63) */
  value: number;
}

/**
 * Clean genome string by removing whitespace and comments.
 * @param genome - Raw genome string with optional formatting
 * @param options - Optional configuration
 * @returns Continuous base string without whitespace or comments
 *
 * @example
 * ```typescript
 * cleanGenome("ATG GGA TAA ; comment") // "ATGGGATAAA"
 * cleanGenome("ATG\n  GGA\n  TAA") // "ATGGGATAAA"
 * cleanGenome("atg gga taa", { uppercase: true }) // "ATGGGATAAA"
 * ```
 */
export function cleanGenome(
  genome: string,
  options: CleanGenomeOptions = {},
): string {
  const { uppercase = false } = options;
  let result = genome.replace(/\s+/g, "").replace(/;.*/g, "");
  if (uppercase) {
    result = result.toUpperCase();
  }
  return result;
}

/**
 * Parse genome string into array of codons.
 * Strips comments and whitespace, chunks into triplets.
 * @param genome - Raw genome string with optional formatting
 * @returns Array of three-character codon strings
 *
 * @example
 * ```typescript
 * parseGenome("ATG GGA TAA") // ["ATG", "GGA", "TAA"]
 * parseGenome("ATG\nGGA ; circle\nTAA") // ["ATG", "GGA", "TAA"]
 * ```
 */
export function parseGenome(genome: string): string[] {
  // Strip comments and whitespace
  const cleaned = genome
    .split("\n")
    .map((line) => line.split(";")[0])
    .join("")
    .replace(/\s+/g, "");

  const codons: string[] = [];
  for (let i = 0; i < cleaned.length; i += 3) {
    codons.push(cleaned.slice(i, i + 3));
  }
  return codons;
}

/**
 * Format continuous base string as space-separated codons.
 * @param bases - Continuous string of bases (e.g., "ATGGGATAAA")
 * @returns Space-separated codon string (e.g., "ATG GGA TAA")
 *
 * @example
 * ```typescript
 * formatAsCodons("ATGGGATAAA") // "ATG GGA TAA"
 * ```
 */
export function formatAsCodons(bases: string): string {
  const codons: string[] = [];
  for (let i = 0; i < bases.length; i += 3) {
    codons.push(bases.slice(i, i + 3));
  }
  return codons.join(" ");
}

// ============ Line-based Parsing ============

/**
 * Parse genome file content into structured lines, preserving comments.
 * Use this when you need line-by-line analysis with comment context.
 *
 * @example
 * ```typescript
 * const lines = parseGenomeLines("ATG\n  GAA CCC GGA  ; Push 21, circle\nTAA");
 * // [
 * //   { lineNumber: 1, codons: ["ATG"], comment: null, raw: "ATG" },
 * //   { lineNumber: 2, codons: ["GAA", "CCC", "GGA"], comment: "Push 21, circle", raw: "..." },
 * //   { lineNumber: 3, codons: ["TAA"], comment: null, raw: "TAA" }
 * // ]
 * ```
 */
export function parseGenomeLines(content: string): GenomeLine[] {
  const lines = content.split("\n");
  const parsed: GenomeLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const commentIndex = line.indexOf(";");

    let codons: string[] = [];
    let comment: string | null = null;

    if (commentIndex >= 0) {
      comment = line.slice(commentIndex + 1).trim();
      const codesPart = line.slice(0, commentIndex).trim();
      codons = codesPart.split(/\s+/).filter((c) => /^[ACGT]{3}$/i.test(c));
    } else {
      codons = line
        .trim()
        .split(/\s+/)
        .filter((c) => /^[ACGT]{3}$/i.test(c));
    }

    parsed.push({
      lineNumber: i + 1,
      codons: codons.map((c) => c.toUpperCase()),
      comment: comment || null,
      raw: line,
    });
  }

  return parsed;
}

/**
 * Check if a codon is a PUSH opcode (GA* pattern).
 * PUSH instructions load the next codon as a numeric value onto the stack.
 */
export function isPushCodon(codon: string): boolean {
  return codon.toUpperCase().startsWith("GA");
}

/**
 * Find numeric literals in a codon sequence.
 * A numeric literal is the codon immediately following a PUSH (GA*) opcode.
 *
 * @example
 * ```typescript
 * findNumericLiterals(["GAA", "CCC", "GGA", "GAA", "AAA", "TTA"]);
 * // [
 * //   { index: 1, codon: "CCC", value: 21 },
 * //   { index: 4, codon: "AAA", value: 0 }
 * // ]
 * ```
 */
export function findNumericLiterals(codons: string[]): NumericLiteral[] {
  const literals: NumericLiteral[] = [];

  for (let i = 0; i < codons.length - 1; i++) {
    if (isPushCodon(codons[i])) {
      const literalCodon = codons[i + 1];
      literals.push({
        index: i + 1,
        codon: literalCodon,
        value: decodeCodonValue(literalCodon),
      });
    }
  }

  return literals;
}

// ============ Comment Value Extraction ============

/** Patterns to extract numeric values from comments */
const COMMENT_VALUE_PATTERNS = [
  // Color(r, g, b) pattern
  /Color\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi,
  // Ellipse/Rect WxH pattern
  /(?:Ellipse|Rect)\s+(\d+)\s*[x\xD7]\s*(\d+)/gi,
  // Generic (x, y) pairs
  /\(\s*(\d+)\s*,\s*(\d+)\s*\)/g,
  // Operation followed by number: "Rotate 30", "Circle 21", "PUSH 37"
  /(?:Rotate|Circle|Line|Scale|Translate|PUSH|Push|push)\s+(\d+)/gi,
  // Standalone numbers that look like values (not line refs)
  /\b(\d{1,2})\b(?!\s*(?:degrees|deg|px|%|x\d))/g,
];

/** Extract values from a single regex pattern match */
function extractMatchValues(match: RegExpExecArray): number[] {
  const values: number[] = [];
  for (let i = 1; i < match.length; i++) {
    if (match[i] !== undefined) {
      const num = Number.parseInt(match[i], 10);
      if (num >= 0 && num <= 63) {
        values.push(num);
      }
    }
  }
  return values;
}

/** Apply a pattern to comment and collect all matched values */
function extractPatternValues(pattern: RegExp, comment: string): number[] {
  const values: number[] = [];
  pattern.lastIndex = 0;
  let match = pattern.exec(comment);
  while (match !== null) {
    values.push(...extractMatchValues(match));
    match = pattern.exec(comment);
  }
  return values;
}

/**
 * Extract numeric values from a genome comment string.
 * Recognizes common patterns like Color(r,g,b), operation names, and standalone numbers.
 *
 * @example
 * ```typescript
 * extractCommentValues("Set color (21, 0, 0) - red")  // [21, 0, 0]
 * extractCommentValues("Rotate 30 degrees")          // [30]
 * extractCommentValues("Circle 21")                  // [21]
 * extractCommentValues("Ellipse 53x21")              // [53, 21]
 * ```
 */
export function extractCommentValues(comment: string): number[] {
  const allValues: number[] = [];

  for (const pattern of COMMENT_VALUE_PATTERNS) {
    for (const val of extractPatternValues(pattern, comment)) {
      if (!allValues.includes(val)) {
        allValues.push(val);
      }
    }
  }

  return allValues;
}
