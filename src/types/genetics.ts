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
const DNA_LETTERS = ["A", "C", "G", "T"] as const;

/**
 * Valid single-letter codes for RNA bases.
 * @remarks Uracil (U) replaces Thymine in RNA.
 */
const RNA_LETTERS = ["A", "C", "G", "U"] as const;

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
 * Letter is constrained to {@link DNABaseLetter} ("A" | "C" | "G" | "T").
 */
type DNABase = BaseObject<"DNA">;

/**
 * RNA-specific base object.
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
};

export { BASES, DNA_LETTERS, RNA_LETTERS, createBase, isDNA, isRNA };

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
 * Three-character DNA/RNA triplet (codon).
 * Each codon maps to an executable opcode instruction.
 * Supports both DNA (T) and RNA (U) notation.
 * @example 'ATG', 'GGA', 'TAA' // DNA
 * @example 'AUG', 'GGA', 'UAA' // RNA
 */
export type Codon = `${Base}${Base}${Base}`;

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

/**
 * Codon to Opcode mapping table.
 * Defines all 64 possible codon → opcode translations.
 *
 * Design principles:
 * - Synonymous codons (codon families) map to same opcode (models genetic redundancy)
 * - 4 codons per family (e.g., GG* → CIRCLE) for pedagogical silent mutations
 * - ATG = START (matches biological start codon)
 * - TAA/TAG/TGA = STOP (matches biological stop codons)
 *
 * @example
 * ```typescript
 * CODON_MAP['GGA'] === Opcode.CIRCLE  // true
 * CODON_MAP['GGC'] === Opcode.CIRCLE  // true (synonymous)
 * CODON_MAP['ATG'] === Opcode.START   // true (start codon)
 * ```
 */
export const CODON_MAP: Record<string, Opcode> = {
  // Control Flow
  ATG: Opcode.START,
  TAA: Opcode.STOP,
  TAG: Opcode.STOP,
  TGA: Opcode.STOP,

  // Drawing Primitives
  GGA: Opcode.CIRCLE,
  GGC: Opcode.CIRCLE,
  GGG: Opcode.CIRCLE,
  GGT: Opcode.CIRCLE,
  CCA: Opcode.RECT,
  CCC: Opcode.RECT,
  CCG: Opcode.RECT,
  CCT: Opcode.RECT,
  AAA: Opcode.LINE,
  AAC: Opcode.LINE,
  AAG: Opcode.LINE,
  AAT: Opcode.LINE,
  GCA: Opcode.TRIANGLE,
  GCC: Opcode.TRIANGLE,
  GCG: Opcode.TRIANGLE,
  GCT: Opcode.TRIANGLE,
  GTA: Opcode.ELLIPSE,
  GTC: Opcode.ELLIPSE,
  GTG: Opcode.ELLIPSE,
  GTT: Opcode.ELLIPSE,

  // Transform Operations
  ACA: Opcode.TRANSLATE,
  ACC: Opcode.TRANSLATE,
  ACG: Opcode.TRANSLATE,
  ACT: Opcode.TRANSLATE,
  AGA: Opcode.ROTATE,
  AGC: Opcode.ROTATE,
  AGG: Opcode.ROTATE,
  AGT: Opcode.ROTATE,
  CGA: Opcode.SCALE,
  CGC: Opcode.SCALE,
  CGG: Opcode.SCALE,
  CGT: Opcode.SCALE,
  TTA: Opcode.COLOR,
  TTC: Opcode.COLOR,
  TTG: Opcode.COLOR,
  TTT: Opcode.COLOR,

  // Stack Operations
  GAA: Opcode.PUSH,
  GAG: Opcode.PUSH,
  GAC: Opcode.PUSH,
  GAT: Opcode.PUSH,
  ATA: Opcode.DUP,
  ATC: Opcode.DUP,
  ATT: Opcode.DUP,

  // Utility
  CAC: Opcode.NOP,
  TAC: Opcode.POP,
  TAT: Opcode.POP,
  TGC: Opcode.POP,

  // Advanced Operations
  TGG: Opcode.SWAP,
  TGT: Opcode.SWAP,
  TCA: Opcode.SAVE_STATE,
  TCC: Opcode.SAVE_STATE,
  TCG: Opcode.RESTORE_STATE,
  TCT: Opcode.RESTORE_STATE,

  // Arithmetic Operations
  CTG: Opcode.ADD,
  CAG: Opcode.SUB,
  CTT: Opcode.MUL,
  CAT: Opcode.DIV,

  // Comparison Operations
  CTA: Opcode.EQ, // Equality comparison [a, b] → [1 if a==b else 0]
  CTC: Opcode.LT, // Less than comparison [a, b] → [1 if a<b else 0]

  // Control Flow Operations
  CAA: Opcode.LOOP,
};
