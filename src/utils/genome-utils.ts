/**
 * Shared genome string manipulation utilities.
 * Used by mutations.ts, assessment-engine.ts, and other genome processing code.
 */

/**
 * Options for cleanGenome function.
 */
export interface CleanGenomeOptions {
  /** Normalize to uppercase (default: false) */
  uppercase?: boolean;
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
