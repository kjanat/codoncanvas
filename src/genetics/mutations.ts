/**
 * @fileoverview Mutation tools for CodonCanvas genomes.
 * Implements biological mutation types for educational demonstrations.
 *
 * Mutation Types:
 * - **Silent**: Same opcode (synonymous codon substitution)
 * - **Missense**: Different opcode (functional change)
 * - **Nonsense**: Introduces STOP codon (truncation)
 * - **Point**: Single base substitution (can be silent/missense/nonsense)
 * - **Insertion**: Add bases (can cause frameshift if not divisible by 3)
 * - **Deletion**: Remove bases (can cause frameshift if not divisible by 3)
 * - **Frameshift**: Insert/delete 1-2 bases (scrambles downstream codons)
 */

import {
  type BaseLetter,
  CODON_MAP,
  type Codon,
  DNA_LETTERS,
  lookupCodon,
  type MutationType,
  Opcode,
} from "@/types";
import { cleanGenome, formatAsCodons, parseGenome } from "@/utils/genome-utils";

/**
 * Result of applying a mutation to a genome.
 * Contains original/mutated sequences and metadata for diff viewer.
 */
export interface MutationResult {
  /** Original genome string */
  original: string;
  /** Mutated genome string */
  mutated: string;
  /** Classification of mutation type */
  type: MutationType;
  /** Character position where mutation occurred */
  position: number;
  /** Human-readable description of the mutation */
  description: string;
}

/** DNA bases used for mutation operations (excludes U since we normalize to T) */
const BASES: readonly BaseLetter[] = DNA_LETTERS;
const STOP_CODONS: Set<Codon> = new Set([
  "TAA" as Codon,
  "TAG" as Codon,
  "TGA" as Codon,
]);

/**
 * Get synonymous codons (same opcode) for a given codon.
 * Used for silent mutation generation.
 * @param codon - Source codon to find synonyms for
 * @returns Array of codons that map to the same opcode
 * @internal
 */
function getSynonymousCodons(codon: Codon): Codon[] {
  const opcode = CODON_MAP[codon];
  if (opcode === undefined) {
    return [];
  }

  return Object.entries(CODON_MAP)
    .filter(([c, op]) => op === opcode && c !== codon)
    .map(([c]) => c as Codon);
}

/**
 * Get missense codons (different opcode, but not STOP) for a given codon.
 * Used for missense mutation generation.
 * @param codon - Source codon to find alternatives for
 * @returns Array of codons with different opcodes (excluding STOP)
 * @internal
 */
function getMissenseCodons(codon: Codon): Codon[] {
  const opcode = CODON_MAP[codon];
  if (opcode === undefined) {
    return [];
  }

  return Object.entries(CODON_MAP)
    .filter(
      ([c, op]) => op !== opcode && !STOP_CODONS.has(c as Codon) && c !== codon,
    )
    .map(([c]) => c as Codon);
}

/**
 * Apply silent mutation - change codon to synonymous variant.
 *
 * Substitutes a codon with another that maps to the same opcode.
 * Demonstrates genetic redundancy (multiple codons = same function).
 *
 * @param genome - Source genome string (with or without formatting)
 * @param position - Optional codon index (0-based); random if not specified
 * @returns Mutation result with original/mutated genomes and metadata
 * @throws {Error} If no synonymous codons available in genome
 * @throws {Error} If specified position is out of range
 * @throws {Error} If codon at position has no synonyms
 *
 * @example
 * ```typescript
 * const result = applySilentMutation('ATG GGA TAA'); // GGA → GGC (both CIRCLE)
 * // result.description: "Silent mutation: GGA → GGC (same opcode: CIRCLE)"
 * ```
 */
export function applySilentMutation(
  genome: string,
  position?: number,
): MutationResult {
  const codons = parseGenome(genome);

  // Find position with synonymous codons
  let targetPos = position;
  if (targetPos === undefined || targetPos >= codons.length) {
    const candidates = codons
      .map((c, i) => ({ codon: c as Codon, index: i }))
      .filter(({ codon }) => getSynonymousCodons(codon).length > 0);

    if (candidates.length === 0) {
      throw new Error("No synonymous mutations available in this genome");
    }

    const selectedCandidate =
      candidates[Math.floor(Math.random() * candidates.length)];
    if (!selectedCandidate) {
      throw new Error("No synonymous mutations available in this genome");
    }
    targetPos = selectedCandidate.index;
  }

  const originalCodon = codons[targetPos];
  if (!originalCodon) {
    throw new Error(`Invalid position ${targetPos}`);
  }
  const synonymous = getSynonymousCodons(originalCodon as Codon);

  if (synonymous.length === 0) {
    throw new Error(
      `No synonymous codons for ${originalCodon} at position ${targetPos}`,
    );
  }

  const newCodon = synonymous[Math.floor(Math.random() * synonymous.length)];
  if (!newCodon) {
    throw new Error("Failed to select synonymous codon");
  }
  codons[targetPos] = newCodon;

  const opcode = lookupCodon(originalCodon);
  return {
    original: genome,
    mutated: codons.join(" "),
    type: "silent",
    position: targetPos,
    description: `Silent mutation: ${originalCodon} → ${newCodon} (same opcode: ${
      opcode !== undefined ? Opcode[opcode] : "UNKNOWN"
    })`,
  };
}

/**
 * Apply missense mutation - change codon to different opcode.
 *
 * Substitutes a codon with one that changes the instruction (but not to STOP).
 * Demonstrates functional changes from point mutations.
 *
 * @param genome - Source genome string (with or without formatting)
 * @param position - Optional codon index (0-based); random if not specified
 * @returns Mutation result showing opcode change
 * @throws {Error} If no missense codons available in genome
 * @throws {Error} If specified position is out of range
 *
 * @example
 * ```typescript
 * const result = applyMissenseMutation('ATG GGA TAA'); // GGA → CCA (CIRCLE → RECT)
 * // result.description: "Missense mutation: GGA → CCA (CIRCLE → RECT)"
 * ```
 */
export function applyMissenseMutation(
  genome: string,
  position?: number,
): MutationResult {
  const codons = parseGenome(genome);

  let targetPos = position;
  if (targetPos === undefined || targetPos >= codons.length) {
    const candidates = codons
      .map((c, i) => ({ codon: c as Codon, index: i }))
      .filter(({ codon }) => getMissenseCodons(codon).length > 0);

    if (candidates.length === 0) {
      throw new Error("No missense mutations available in this genome");
    }

    const selectedCandidate =
      candidates[Math.floor(Math.random() * candidates.length)];
    if (!selectedCandidate) {
      throw new Error("No missense mutations available in this genome");
    }
    targetPos = selectedCandidate.index;
  }

  const originalCodon = codons[targetPos];
  if (!originalCodon) {
    throw new Error(`Invalid position ${targetPos}`);
  }
  const missense = getMissenseCodons(originalCodon as Codon);

  if (missense.length === 0) {
    throw new Error(
      `No missense codons for ${originalCodon} at position ${targetPos}`,
    );
  }

  const newCodon = missense[Math.floor(Math.random() * missense.length)];
  if (!newCodon) {
    throw new Error("Failed to select missense codon");
  }
  codons[targetPos] = newCodon;

  const origOpcode = lookupCodon(originalCodon);
  const newOpcode = lookupCodon(newCodon);
  return {
    original: genome,
    mutated: codons.join(" "),
    type: "missense",
    position: targetPos,
    description: `Missense mutation: ${originalCodon} → ${newCodon} (${
      origOpcode !== undefined ? Opcode[origOpcode] : "UNKNOWN"
    } → ${newOpcode !== undefined ? Opcode[newOpcode] : "UNKNOWN"})`,
  };
}

/**
 * Apply nonsense mutation - introduce STOP codon.
 *
 * Substitutes a codon with TAA (STOP), causing early termination.
 * Demonstrates truncation effects from premature stop codons.
 *
 * @param genome - Source genome string (with or without formatting)
 * @param position - Optional codon index (0-based); random if not specified (avoids START/existing STOP)
 * @returns Mutation result showing truncation point
 * @throws {Error} If no valid mutation positions available (e.g., genome is just START+STOP)
 * @throws {Error} If specified position is out of range
 *
 * @example
 * ```typescript
 * const result = applyNonsenseMutation('ATG GGA CCA TAA'); // GGA → TAA
 * // result.description: "Nonsense mutation: GGA → TAA (early termination)"
 * // Output will be truncated (CIRCLE missing)
 * ```
 */
export function applyNonsenseMutation(
  genome: string,
  position?: number,
): MutationResult {
  const codons = parseGenome(genome);

  let targetPos = position;
  if (targetPos === undefined || targetPos >= codons.length) {
    // Avoid mutating the START codon or existing STOP codons
    const candidates = codons
      .map((c, i) => ({ codon: c as Codon, index: i }))
      .filter(
        ({ codon, index }) =>
          codon !== "ATG" && !STOP_CODONS.has(codon) && index > 0,
      );

    if (candidates.length === 0) {
      throw new Error("No nonsense mutation positions available");
    }

    const selectedCandidate =
      candidates[Math.floor(Math.random() * candidates.length)];
    if (!selectedCandidate) {
      throw new Error("No nonsense mutation positions available");
    }
    targetPos = selectedCandidate.index;
  }

  const originalCodon = codons[targetPos];
  if (!originalCodon) {
    throw new Error(`Invalid position ${targetPos}`);
  }
  const stopCodon = "TAA"; // Use TAA as standard STOP

  codons[targetPos] = stopCodon;

  return {
    original: genome,
    mutated: codons.join(" "),
    type: "nonsense",
    position: targetPos,
    description: `Nonsense mutation: ${originalCodon} → ${stopCodon} (early termination)`,
  };
}

/**
 * Apply point mutation - random single base change.
 *
 * Substitutes one base (A/C/G/T) with another at character level.
 * Can result in silent, missense, or nonsense effects depending on position.
 *
 * @param genome - Source genome string (with or without formatting)
 * @param position - Optional character index (0-based, in cleaned genome); random if not specified
 * @returns Mutation result with base-level change description
 * @throws {Error} If specified position is out of range
 *
 * @example
 * ```typescript
 * const result = applyPointMutation('ATG GGA TAA'); // Changes one base
 * // Could be: "Point mutation: G→C at position 5 (GGA→GCA: CIRCLE→TRIANGLE)"
 * ```
 */
export function applyPointMutation(
  genome: string,
  position?: number,
): MutationResult {
  const cleaned = cleanGenome(genome);

  const targetPos = position ?? Math.floor(Math.random() * cleaned.length);
  if (targetPos >= cleaned.length) {
    throw new Error(`Position ${targetPos} out of range`);
  }

  const originalBase = cleaned[targetPos];
  const otherBases = BASES.filter((b) => b !== originalBase);
  const newBase = otherBases[Math.floor(Math.random() * otherBases.length)];

  const mutated =
    cleaned.substring(0, targetPos) +
    newBase +
    cleaned.substring(targetPos + 1);

  return {
    original: genome,
    mutated: formatAsCodons(mutated),
    type: "point",
    position: targetPos,
    description: `Point mutation at base ${targetPos}: ${originalBase} → ${newBase}`,
  };
}

/**
 * Apply insertion - insert 1-3 random bases.
 *
 * Inserts new bases at character level. If length not divisible by 3, causes frameshift.
 *
 * @param genome - Source genome string (with or without formatting)
 * @param position - Optional character index (0-based); random if not specified
 * @param length - Number of bases to insert (default: 1)
 * @returns Mutation result with inserted sequence
 * @throws {Error} If specified position is out of range (beyond genome length)
 *
 * @example
 * ```typescript
 * const result = applyInsertion('ATG GGA TAA', undefined, 3);
 * // Inserts 3 bases (no frameshift): "Insertion at base 5: +ACG (3 bases)"
 * const frameshift = applyInsertion('ATG GGA TAA', undefined, 1);
 * // Inserts 1 base (frameshift): Scrambles downstream codons
 * ```
 */
export function applyInsertion(
  genome: string,
  position?: number,
  length: number = 1,
): MutationResult {
  const cleaned = cleanGenome(genome);

  const targetPos = position ?? Math.floor(Math.random() * cleaned.length);
  if (targetPos > cleaned.length) {
    throw new Error(`Position ${targetPos} out of range`);
  }

  // Generate random bases
  const insertion = Array.from(
    { length },
    () => BASES[Math.floor(Math.random() * BASES.length)],
  ).join("");

  const mutated =
    cleaned.substring(0, targetPos) + insertion + cleaned.substring(targetPos);

  return {
    original: genome,
    mutated: formatAsCodons(mutated),
    type: "insertion",
    position: targetPos,
    description: `Insertion at base ${targetPos}: +${insertion} (${length} base${
      length > 1 ? "s" : ""
    })`,
  };
}

/**
 * Apply deletion - remove 1-3 bases.
 *
 * Deletes bases at character level. If length not divisible by 3, causes frameshift.
 *
 * @param genome - Source genome string (with or without formatting)
 * @param position - Optional character index (0-based); random if not specified
 * @param length - Number of bases to delete (default: 1)
 * @returns Mutation result with deleted sequence
 * @throws {Error} If deletion at position+length exceeds genome length
 *
 * @example
 * ```typescript
 * const result = applyDeletion('ATG GGA CCA TAA', undefined, 3);
 * // Deletes 3 bases (removes 1 codon): "Deletion at base 3: -GGA (3 bases)"
 * const frameshift = applyDeletion('ATG GGA CCA TAA', undefined, 1);
 * // Deletes 1 base (frameshift): Scrambles downstream codons
 * ```
 */
export function applyDeletion(
  genome: string,
  position?: number,
  length: number = 1,
): MutationResult {
  const cleaned = cleanGenome(genome);

  const targetPos =
    position ??
    Math.floor(Math.random() * Math.max(0, cleaned.length - length));
  if (targetPos + length > cleaned.length) {
    throw new Error(
      `Deletion at position ${targetPos} with length ${length} exceeds genome length`,
    );
  }

  const deleted = cleaned.substring(targetPos, targetPos + length);
  const mutated =
    cleaned.substring(0, targetPos) + cleaned.substring(targetPos + length);

  return {
    original: genome,
    mutated: formatAsCodons(mutated),
    type: "deletion",
    position: targetPos,
    description: `Deletion at base ${targetPos}: -${deleted} (${length} base${
      length > 1 ? "s" : ""
    })`,
  };
}

/**
 * Apply frameshift mutation - insert or delete 1-2 bases.
 * Randomly chooses insertion or deletion with length 1-2 (never 3).
 * Guaranteed to disrupt reading frame, scrambling all downstream codons.
 * Most dramatic mutation type for educational demonstration.
 *
 * @param genome - Source genome string
 * @param position - Optional character index (random if not specified)
 * @returns Mutation result with frameshift description
 *
 * @example
 * ```typescript
 * const result = applyFrameshiftMutation('ATG GGA CCA GCA TAA');
 * // Could insert 1-2 bases: "Frameshift: insertion of 2 bases at position 6"
 * // Or delete 1-2 bases: "Frameshift: deletion of 1 base at position 9"
 * // All downstream codons completely scrambled
 * ```
 */
export function applyFrameshiftMutation(
  genome: string,
  position?: number,
): MutationResult {
  const isInsertion = Math.random() < 0.5;
  const length = Math.floor(Math.random() * 2) + 1; // 1 or 2 bases

  if (isInsertion) {
    const result = applyInsertion(genome, position, length);
    result.type = "frameshift";
    result.description = `Frameshift (insertion): ${result.description}`;
    return result;
  } else {
    const result = applyDeletion(genome, position, length);
    result.type = "frameshift";
    result.description = `Frameshift (deletion): ${result.description}`;
    return result;
  }
}

/**
 * Mutation function lookup table for type-safe dispatch.
 * Maps mutation type strings to their implementation functions.
 */
const MUTATION_FUNCTIONS = {
  silent: applySilentMutation,
  missense: applyMissenseMutation,
  nonsense: applyNonsenseMutation,
  point: applyPointMutation,
  insertion: applyInsertion,
  deletion: applyDeletion,
  frameshift: applyFrameshiftMutation,
} as const;

/**
 * Array of all valid mutation types.
 * Derived from MUTATION_FUNCTIONS keys - single source of truth.
 */
export const MUTATION_TYPES = Object.keys(
  MUTATION_FUNCTIONS,
) as readonly MutationType[];

/**
 * Apply a mutation by type name.
 * Convenience function that dispatches to the appropriate mutation function.
 *
 * @param type - Mutation type to apply
 * @param genome - Source genome string
 * @returns Mutation result with original, mutated, and metadata
 * @throws Error if mutation type is unknown
 *
 * @example
 * ```typescript
 * const result = getMutationByType('silent', 'ATG GGA TAA');
 * // Applies silent mutation and returns result
 * ```
 */
export function getMutationByType(
  type: MutationType,
  genome: string,
): MutationResult {
  const mutationFn = MUTATION_FUNCTIONS[type];
  if (!mutationFn) {
    throw new Error(`Unknown mutation type: ${type}`);
  }
  return mutationFn(genome);
}

/**
 * Compare two genomes and highlight differences.
 * Utility function for diff viewer UI to show mutation effects.
 * Aligns codons and identifies all positions where they differ.
 *
 * @param original - Original genome string
 * @param mutated - Mutated genome string
 * @returns Object with aligned codons and difference metadata
 *
 * @example
 * ```typescript
 * const result = compareGenomes('ATG GGA TAA', 'ATG GGC TAA');
 * // result.differences: [{ position: 1, original: 'GGA', mutated: 'GGC' }]
 * // Shows that codon at index 1 changed (silent mutation)
 * ```
 */
export function compareGenomes(
  original: string,
  mutated: string,
): {
  originalCodons: string[];
  mutatedCodons: string[];
  differences: Array<{ position: number; original: string; mutated: string }>;
} {
  const originalCodons = parseGenome(original);
  const mutatedCodons = parseGenome(mutated);

  const maxLength = Math.max(originalCodons.length, mutatedCodons.length);
  const differences: Array<{
    position: number;
    original: string;
    mutated: string;
  }> = [];

  for (let i = 0; i < maxLength; i++) {
    const orig = originalCodons[i] || "";
    const mut = mutatedCodons[i] || "";

    if (orig !== mut) {
      differences.push({
        position: i,
        original: orig,
        mutated: mut,
      });
    }
  }

  return { originalCodons, mutatedCodons, differences };
}
