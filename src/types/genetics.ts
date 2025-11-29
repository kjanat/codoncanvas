/**
 * @fileoverview Nucleotide base type system for CodonCanvas
 *
 * Provides a comprehensive, type-safe representation of DNA/RNA nucleotide bases
 * using a single source of truth pattern. All types are derived from const objects
 * to ensure consistency and enable compile-time validation.
 *
 * **Architecture:**
 * - {@link BASES} - Single source of truth mapping letters to full names
 * - {@link DNA_LETTERS} / {@link RNA_LETTERS} - Valid letters per nucleic acid type
 * - All other types derived using `keyof`, `typeof`, and indexed access types
 *
 * **Type Hierarchy:**
 * ```
 * BaseLetter ("A" | "C" | "G" | "T" | "U")
 *    ├── DNABaseLetter ("A" | "C" | "G" | "T")
 *    └── RNABaseLetter ("A" | "C" | "G" | "U")
 *
 * BaseObject<T extends NucleicAcidType>
 *    ├── DNABase (BaseObject<"DNA">)
 *    └── RNABase (BaseObject<"RNA">)
 * ```
 *
 * @module types/genetics
 *
 * @example
 * ```typescript
 * // String literal usage (simple):
 * const letter: BaseLetter = "A";
 *
 * // Object usage (full type safety):
 * const adenine = createBase("DNA", "A");
 * // => { type: "DNA", letter: "A", name: "Adenine" }
 *
 * // Type guard usage:
 * if (isDNA(base)) {
 *   // base.letter is "A" | "C" | "G" | "T" (no "U")
 * }
 *
 * // Compile-time error:
 * createBase("DNA", "U"); // Error: "U" not in DNABaseLetter
 * ```
 */

import type { Severity } from "@/types/common";
import { Opcode } from "@/types/vm";

// ============ SINGLE SOURCE OF TRUTH ============

/**
 * Canonical mapping of nucleotide base letters to their full biochemical names.
 *
 * This is the **single source of truth** for all base-related types in the system.
 * All derived types use `keyof typeof BASES` or indexed access to ensure consistency.
 *
 * @remarks
 * - A, C, G are shared between DNA and RNA
 * - T (Thymine) is DNA-specific
 * - U (Uracil) is RNA-specific
 * - In CodonCanvas, U and T are treated as equivalent for codon mapping
 *
 * @example
 * ```typescript
 * BASES.A // => "Adenine"
 * BASES.T // => "Thymine"
 * Object.keys(BASES) // => ["A", "C", "G", "T", "U"]
 * ```
 */
const BASES = {
  A: "Adenine",
  C: "Cytosine",
  G: "Guanine",
  T: "Thymine",
  U: "Uracil",
} as const;

/**
 * Valid single-letter codes for DNA bases.
 * @remarks Thymine (T) is the DNA-specific pyrimidine base.
 */
const DNA_LETTERS = [
  "A",
  "C",
  "G",
  "T",
] as const satisfies readonly (keyof typeof BASES)[];

/**
 * Valid single-letter codes for RNA bases.
 * @remarks Uracil (U) replaces Thymine in RNA.
 */
const RNA_LETTERS = [
  "A",
  "C",
  "G",
  "U",
] as const satisfies readonly (keyof typeof BASES)[];

/**
 * Maps DNA base letters to their base-4 numeric index.
 * Used for decoding numeric literals from codons.
 * @remarks Order matches DNA_LETTERS: A=0, C=1, G=2, T=3
 */
const DNA_BASE_TO_INDEX = {
  A: 0,
  C: 1,
  G: 2,
  T: 3,
} as const satisfies Record<(typeof DNA_LETTERS)[number], number>;

// ============ DERIVED TYPES ============

/**
 * Single-letter nucleotide base code.
 *
 * Union of all valid base letters: `"A" | "C" | "G" | "T" | "U"`.
 * Derived from {@link BASES} keys to ensure type safety.
 *
 * @remarks This is the recommended type for simple string-based base handling.
 *
 * @example
 * ```typescript
 * const base: BaseLetter = "A"; // OK
 * const base: BaseLetter = "X"; // Error: not assignable
 * ```
 */
type BaseLetter = keyof typeof BASES;

/**
 * DNA-specific base letters.
 *
 * Derived from {@link DNA_LETTERS} array.
 */
type DNABaseLetter = (typeof DNA_LETTERS)[number];

/**
 * RNA-specific base letters.
 *
 * Derived from {@link RNA_LETTERS} array.
 */
type RNABaseLetter = (typeof RNA_LETTERS)[number];

/**
 * Full biochemical names for nucleotide bases.
 *
 * Derived from {@link BASES} values.
 */
type BaseName = (typeof BASES)[BaseLetter];

/**
 * Maps a base letter to its full biochemical name.
 *
 * @typeParam L - A valid base letter from {@link BaseLetter}
 *
 * @example
 * ```typescript
 * type AdenineName = BaseNameFor<"A">; // => "Adenine"
 * type ThymineName = BaseNameFor<"T">; // => "Thymine"
 * ```
 */
type BaseNameFor<L extends BaseLetter> = (typeof BASES)[L];

/**
 * Generic nucleotide base structure with letter and derived name.
 *
 * @typeParam L - A valid base letter from {@link BaseLetter}
 *
 * @example
 * ```typescript
 * type Adenine = NucleotideBase<"A">;
 * // => { readonly letter: "A"; readonly name: "Adenine" }
 * ```
 */
type NucleotideBase<L extends BaseLetter> = {
  readonly letter: L;
  readonly name: BaseNameFor<L>;
};

/**
 * Discriminator for nucleic acid types.
 * Used in {@link BaseObject} for type-safe DNA/RNA distinction.
 */
type NucleicAcidType = "DNA" | "RNA";

/**
 * Maps nucleic acid type to its valid base letters.
 *
 * @typeParam T - Either "DNA" or "RNA"
 * @returns {@link DNABaseLetter} for DNA, {@link RNABaseLetter} for RNA
 *
 * @example
 * ```typescript
 * type DNALetters = LettersFor<"DNA">; // => "A" | "C" | "G" | "T"
 * type RNALetters = LettersFor<"RNA">; // => "A" | "C" | "G" | "U"
 * ```
 */
type LettersFor<T extends NucleicAcidType> = T extends "DNA"
  ? DNABaseLetter
  : RNABaseLetter;

/**
 * Discriminated union representing a nucleotide base with full type information.
 *
 * Provides compile-time enforcement of valid letter/type combinations.
 * Use {@link createBase} to construct instances.
 *
 * @typeParam T - Nucleic acid type ("DNA" | "RNA"), defaults to union of both
 *
 * @example
 * ```typescript
 * // DNA base - only T allowed, not U
 * const dnaBase: BaseObject<"DNA"> = { type: "DNA", letter: "T", name: "Thymine" };
 *
 * // RNA base - only U allowed, not T
 * const rnaBase: BaseObject<"RNA"> = { type: "RNA", letter: "U", name: "Uracil" };
 *
 * // Generic base - either DNA or RNA
 * const anyBase: BaseObject = dnaBase; // OK
 * ```
 */
type BaseObject<T extends NucleicAcidType = NucleicAcidType> = {
  /** Nucleic acid type discriminator */
  readonly type: T;
  /** Single-letter base code (constrained by nucleic acid type) */
  readonly letter: LettersFor<T>;
  /** Full biochemical name (derived from letter) */
  readonly name: BaseNameFor<LettersFor<T>>;
};

/**
 * DNA-specific base object.
 *
 * Letter is constrained to {@link DNABaseLetter} ("A" | "C" | "G" | "T").
 */
type DNABase = BaseObject<"DNA">;

/**
 * RNA-specific base object.
 *
 * Letter is constrained to {@link RNABaseLetter} ("A" | "C" | "G" | "U").
 */
type RNABase = BaseObject<"RNA">;

// ============ RUNTIME HELPERS ============

/**
 * Factory function to create a type-safe base object.
 *
 * Enforces compile-time validation that the letter is valid for the given
 * nucleic acid type (e.g., "U" is invalid for DNA).
 *
 * @typeParam T - Nucleic acid type ("DNA" or "RNA")
 * @typeParam L - Base letter (constrained by T)
 * @param type - Nucleic acid type
 * @param letter - Single-letter base code
 * @returns Fully typed {@link BaseObject} with derived name
 *
 * @example
 * ```typescript
 * const adenine = createBase("DNA", "A");
 * // => { type: "DNA", letter: "A", name: "Adenine" }
 *
 * const uracil = createBase("RNA", "U");
 * // => { type: "RNA", letter: "U", name: "Uracil" }
 *
 * // Compile-time error:
 * createBase("DNA", "U"); // Error: "U" not assignable to DNABaseLetter
 * ```
 */
function createBase<T extends NucleicAcidType, L extends LettersFor<T>>(
  type: T,
  letter: L,
): BaseObject<T> {
  return {
    type,
    letter,
    name: BASES[letter],
  } as BaseObject<T>;
}

/**
 * Type guard to narrow {@link BaseObject} to {@link DNABase}.
 *
 * @param base - Base object to check
 * @returns `true` if base is DNA, with narrowed type
 *
 * @example
 * ```typescript
 * function processBase(base: BaseObject) {
 *   if (isDNA(base)) {
 *     // base.letter is now "A" | "C" | "G" | "T" (no "U")
 *     console.log(`DNA base: ${base.letter}`);
 *   }
 * }
 * ```
 */
const isDNA = (base: BaseObject): base is DNABase => base.type === "DNA";

/**
 * Type guard to narrow {@link BaseObject} to {@link RNABase}.
 *
 * @param base - Base object to check
 * @returns `true` if base is RNA, with narrowed type
 *
 * @example
 * ```typescript
 * function processBase(base: BaseObject) {
 *   if (isRNA(base)) {
 *     // base.letter is now "A" | "C" | "G" | "U" (no "T")
 *     console.log(`RNA base: ${base.letter}`);
 *   }
 * }
 * ```
 */
const isRNA = (base: BaseObject): base is RNABase => base.type === "RNA";

// ============ CODON TYPE SYSTEM ============

/**
 * Three-letter DNA codon type.
 * Constrained to only valid DNA bases (A, C, G, T).
 * Cannot mix DNA and RNA notation (e.g., "AUT" is invalid).
 *
 * @example
 * ```typescript
 * const valid: DNACodon = "ATG"; // OK
 * const invalid: DNACodon = "AUG"; // Error: U not in DNABaseLetter
 * ```
 */
type DNACodon = `${DNABaseLetter}${DNABaseLetter}${DNABaseLetter}`;

/**
 * Three-letter RNA codon type.
 * Constrained to only valid RNA bases (A, C, G, U).
 * Cannot mix DNA and RNA notation (e.g., "ATG" is invalid).
 *
 * @example
 * ```typescript
 * const valid: RNACodon = "AUG"; // OK
 * const invalid: RNACodon = "ATG"; // Error: T not in RNABaseLetter
 * ```
 */
type RNACodon = `${RNABaseLetter}${RNABaseLetter}${RNABaseLetter}`;

/**
 * Two-letter codon prefix (first two positions).
 * Used to define four-fold degenerate codon families where the
 * third position (wobble position) doesn't affect the opcode.
 */
type DNACodonPrefix = `${DNABaseLetter}${DNABaseLetter}`;

// ============ CODON FAMILY DEFINITIONS ============

/**
 * Four-fold degenerate codon families.
 * Maps two-letter prefixes to opcodes - the third position is irrelevant.
 * Each prefix expands to 4 codons (e.g., GG → GGA, GGC, GGG, GGT).
 *
 * This mirrors biological codon degeneracy where synonymous codons
 * often share the first two bases (wobble hypothesis).
 */
const CODON_FAMILIES = {
  // Drawing Primitives
  GG: Opcode.CIRCLE, // GGA, GGC, GGG, GGT
  CC: Opcode.RECT, // CCA, CCC, CCG, CCT
  AA: Opcode.LINE, // AAA, AAC, AAG, AAT
  GC: Opcode.TRIANGLE, // GCA, GCC, GCG, GCT
  GT: Opcode.ELLIPSE, // GTA, GTC, GTG, GTT

  // Transform Operations
  AC: Opcode.TRANSLATE, // ACA, ACC, ACG, ACT
  AG: Opcode.ROTATE, // AGA, AGC, AGG, AGT
  CG: Opcode.SCALE, // CGA, CGC, CGG, CGT
  TT: Opcode.COLOR, // TTA, TTC, TTG, TTT

  // Stack Operations
  GA: Opcode.PUSH, // GAA, GAC, GAG, GAT
} as const satisfies Partial<Record<DNACodonPrefix, Opcode>>;

/**
 * Special codons that don't follow four-fold degeneracy.
 * Includes control codons (START/STOP), partial degeneracy,
 * and arithmetic operations.
 */
const SPECIAL_CODONS = {
  // Control Flow (biological start/stop codons)
  ATG: Opcode.START,
  TAA: Opcode.STOP,
  TAG: Opcode.STOP,
  TGA: Opcode.STOP,

  // Stack Operations (partial degeneracy - 3 codons for DUP)
  ATA: Opcode.DUP,
  ATC: Opcode.DUP,
  ATT: Opcode.DUP,

  // Utility Operations
  CAC: Opcode.NOP,
  TAC: Opcode.POP,
  TAT: Opcode.POP,
  TGC: Opcode.POP,

  // Advanced Operations (partial degeneracy)
  TGG: Opcode.SWAP,
  TGT: Opcode.SWAP,
  TCA: Opcode.SAVE_STATE,
  TCC: Opcode.SAVE_STATE,
  TCG: Opcode.RESTORE_STATE,
  TCT: Opcode.RESTORE_STATE,

  // Arithmetic Operations (single codons)
  CTG: Opcode.ADD,
  CAG: Opcode.SUB,
  CTT: Opcode.MUL,
  CAT: Opcode.DIV,

  // Comparison Operations
  CTA: Opcode.EQ, // Equality comparison [a, b] → [1 if a==b else 0]
  CTC: Opcode.LT, // Less than comparison [a, b] → [1 if a<b else 0]

  // Control Flow Operations
  CAA: Opcode.LOOP,
} as const satisfies Partial<Record<DNACodon, Opcode>>;

// ============ CODON MAP BUILDER ============

/**
 * Generates all 64 possible DNA codons.
 * Used for completeness validation.
 */
const ALL_DNA_CODONS: readonly DNACodon[] = DNA_LETTERS.flatMap((a) =>
  DNA_LETTERS.flatMap((b) =>
    DNA_LETTERS.map((c) => `${a}${b}${c}` as DNACodon),
  ),
);

/**
 * Generates all 64 possible RNA codons.
 * Parallel to {@link ALL_DNA_CODONS} for RNA operations.
 */
const ALL_RNA_CODONS: readonly RNACodon[] = RNA_LETTERS.flatMap((a) =>
  RNA_LETTERS.flatMap((b) =>
    RNA_LETTERS.map((c) => `${a}${b}${c}` as RNACodon),
  ),
);

/**
 * Converts a DNA codon to its RNA equivalent (T -> U).
 *
 * @param codon - DNA codon to convert
 * @returns Equivalent RNA codon
 *
 * @example
 * ```typescript
 * dnaCodonToRna("ATG"); // => "AUG"
 * dnaCodonToRna("TAA"); // => "UAA"
 * ```
 */
function dnaCodonToRna(codon: DNACodon): RNACodon {
  return codon.replace(/T/g, "U") as RNACodon;
}

/**
 * Converts an RNA codon to its DNA equivalent (U -> T).
 *
 * @param codon - RNA codon to convert
 * @returns Equivalent DNA codon
 *
 * @example
 * ```typescript
 * rnaCodonToDna("AUG"); // => "ATG"
 * rnaCodonToDna("UAA"); // => "TAA"
 * ```
 */
function rnaCodonToDna(codon: RNACodon): DNACodon {
  return codon.replace(/U/g, "T") as DNACodon;
}

/**
 * Builds the complete codon-to-opcode mapping from family definitions.
 * Expands four-fold families and merges with special codons.
 *
 * @returns Complete mapping of all 64 DNA codons to opcodes
 */
function buildCodonMap(): Record<DNACodon, Opcode> {
  const map = {} as Record<DNACodon, Opcode>;

  // Expand four-fold degenerate families
  for (const [prefix, opcode] of Object.entries(CODON_FAMILIES)) {
    for (const suffix of DNA_LETTERS) {
      const codon = `${prefix}${suffix}` as DNACodon;
      map[codon] = opcode;
    }
  }

  // Merge special codons (overwrites family assignments where needed)
  for (const [codon, opcode] of Object.entries(SPECIAL_CODONS)) {
    map[codon as DNACodon] = opcode;
  }

  return map;
}

/**
 * Internal DNA codon map (strongly typed).
 * All lookups should go through {@link lookupCodon} for RNA support.
 */
const DNA_CODON_MAP: Record<DNACodon, Opcode> = buildCodonMap();

/**
 * RNA codon map - mirrors DNA_CODON_MAP with U instead of T.
 * Enables direct RNA codon lookups without normalization.
 *
 * @example
 * ```typescript
 * RNA_CODON_MAP["AUG"] === Opcode.START // true
 * RNA_CODON_MAP["UAA"] === Opcode.STOP  // true
 * ```
 */
const RNA_CODON_MAP: Record<RNACodon, Opcode> = Object.fromEntries(
  Object.entries(DNA_CODON_MAP).map(([dna, opcode]) => [
    dnaCodonToRna(dna as DNACodon),
    opcode,
  ]),
) as Record<RNACodon, Opcode>;

/**
 * Validates that all 64 DNA codons are mapped.
 * Throws at module load time if any codons are missing.
 *
 * @throws Error if any of the 64 codons are unmapped
 */
function validateCodonMapCompleteness(): void {
  const missing = ALL_DNA_CODONS.filter((c) => !(c in DNA_CODON_MAP));
  if (missing.length > 0) {
    throw new Error(
      `Codon map is incomplete. Missing ${missing.length} codons: ${missing.join(", ")}`,
    );
  }
}

// Run validation at module load (dev-time check)
validateCodonMapCompleteness();

/**
 * Looks up the opcode for a codon, supporting both DNA and RNA notation.
 * RNA codons are normalized by replacing U with T before lookup.
 *
 * @param codon - DNA or RNA codon to look up
 * @returns The opcode for the codon, or undefined if invalid
 *
 * @example
 * ```typescript
 * lookupCodon("ATG"); // => Opcode.START (DNA)
 * lookupCodon("AUG"); // => Opcode.START (RNA, normalized to ATG)
 * lookupCodon("XYZ"); // => undefined (invalid)
 * ```
 */
function lookupCodon(codon: DNACodon | RNACodon | string): Opcode | undefined {
  const normalized = codon.replace(/U/g, "T") as DNACodon;
  return DNA_CODON_MAP[normalized];
}

/**
 * Checks if a string is a valid DNA codon.
 *
 * @param value - String to check
 * @returns True if the string is a valid 3-letter DNA codon
 */
function isDNACodon(value: string): value is DNACodon {
  return (
    value.length === 3 &&
    DNA_LETTERS.includes(value[0] as DNABaseLetter) &&
    DNA_LETTERS.includes(value[1] as DNABaseLetter) &&
    DNA_LETTERS.includes(value[2] as DNABaseLetter)
  );
}

/**
 * Checks if a string is a valid RNA codon.
 *
 * @param value - String to check
 * @returns True if the string is a valid 3-letter RNA codon
 */
function isRNACodon(value: string): value is RNACodon {
  return (
    value.length === 3 &&
    RNA_LETTERS.includes(value[0] as RNABaseLetter) &&
    RNA_LETTERS.includes(value[1] as RNABaseLetter) &&
    RNA_LETTERS.includes(value[2] as RNABaseLetter)
  );
}

// ============ EXPORTS ============

export type {
  BaseLetter,
  BaseName,
  DNABaseLetter,
  RNABaseLetter,
  NucleotideBase,
  NucleicAcidType,
  BaseObject,
  DNABase,
  RNABase,
  DNACodon,
  RNACodon,
};

export {
  BASES,
  DNA_LETTERS,
  RNA_LETTERS,
  DNA_BASE_TO_INDEX,
  createBase,
  isDNA,
  isRNA,
  CODON_FAMILIES,
  SPECIAL_CODONS,
  ALL_DNA_CODONS,
  ALL_RNA_CODONS,
  DNA_CODON_MAP,
  RNA_CODON_MAP,
  lookupCodon,
  isDNACodon,
  isRNACodon,
  dnaCodonToRna,
  rnaCodonToDna,
};

/**
 * Valid DNA/RNA base character.
 *
 * @deprecated Use {@link BaseLetter} for string literals or {@link BaseObject} for full type safety.
 *
 * **Migration Guide:**
 * - For simple string usage: Replace `Base` with `BaseLetter`
 * - For type-safe objects: Use `createBase("DNA", "A")` returning `BaseObject<"DNA">`
 * - For type guards: Use `isDNA(base)` or `isRNA(base)`
 *
 * @example
 * ```typescript
 * // OLD (deprecated):
 * const base: Base = "A";
 *
 * // NEW (string literal):
 * const base: BaseLetter = "A";
 *
 * // NEW (full type safety):
 * const base = createBase("DNA", "A");
 * // base.type === "DNA", base.letter === "A", base.name === "Adenine"
 * ```
 */
export type Base = BaseLetter;

/**
 * Three-character DNA/RNA triplet (codon).
 * Each codon maps to an executable opcode instruction.
 *
 * @remarks
 * This is aliased to {@link DNACodon} for backward compatibility.
 * The codebase uses DNA notation internally (T not U).
 * Use {@link lookupCodon} to look up RNA codons.
 *
 * @example
 * ```typescript
 * const dna: Codon = "ATG"; // OK
 * const rna: Codon = "AUG"; // Error - use RNACodon type for RNA
 * ```
 */
export type Codon = DNACodon;

/**
 * Codon to Opcode mapping table.
 *
 * @remarks
 * This is the strongly-typed version using {@link DNACodon} keys.
 * Use {@link lookupCodon} for RNA codon support.
 *
 * Design principles:
 * - Synonymous codons (codon families) map to same opcode (models genetic redundancy)
 * - 4 codons per family (e.g., GG* → CIRCLE) for pedagogical silent mutations
 * - ATG = START (matches biological start codon)
 * - TAA/TAG/TGA = STOP (matches biological stop codons)
 *
 * @example
 * ```typescript
 * CODON_MAP["GGA"] === Opcode.CIRCLE  // true
 * CODON_MAP["GGC"] === Opcode.CIRCLE  // true (synonymous)
 * CODON_MAP["ATG"] === Opcode.START   // true (start codon)
 *
 * // For RNA codons, use lookupCodon:
 * lookupCodon("AUG") === Opcode.START // true
 * ```
 */
export const CODON_MAP: Record<DNACodon, Opcode> = DNA_CODON_MAP;

/**
 * Types of genetic mutations supported by the mutation engine.
 *
 * - **silent**: Base change with no opcode change (synonymous codon)
 * - **missense**: Base change resulting in different opcode
 * - **nonsense**: Mutation creating premature STOP codon
 * - **point**: Single base substitution (general)
 * - **insertion**: One or more bases inserted
 * - **deletion**: One or more bases removed
 * - **frameshift**: Insertion/deletion not divisible by 3, shifts reading frame
 */
export type MutationType =
  | "silent"
  | "missense"
  | "nonsense"
  | "point"
  | "insertion"
  | "deletion"
  | "frameshift";

/**
 * Rendering output mode for the CodonCanvas application.
 * - **visual**: Canvas-only rendering (default)
 * - **audio**: Audio synthesis only
 * - **both**: Multimodal rendering with synchronized visual and audio output
 */
export type RenderMode = "visual" | "audio" | "both";

/**
 * Array of all valid render modes.
 * Runtime counterpart to RenderMode union for iteration/validation.
 */
export const RENDER_MODES: readonly RenderMode[] = [
  "visual",
  "audio",
  "both",
] as const;

/**
 * Tokenized codon with source location metadata.
 * Used for error reporting and debugging.
 */
export interface CodonToken {
  /** The three-character codon text */
  text: Codon;
  /** Character offset in cleaned source (whitespace/comments removed) */
  position: number;
  /** Source line number (1-indexed, for error messages) */
  line: number;
}

/**
 * Parse or validation error with severity and optional autofix.
 */
export interface ParseError {
  /** Human-readable error description */
  message: string;
  /** Character position where error occurred */
  position: number;
  /** Error severity level */
  severity: Severity;
  /** Optional suggested fix for linter UI */
  fix?: string;
}
