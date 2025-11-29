import type { Severity } from "@/types/common";
import { Opcode } from "@/types/vm";

// ============ SINGLE SOURCE OF TRUTH ============

/**
 * All nucleotide bases with their full names.
 * Single source of truth - all types derive from this.
 */
const BASES = {
  A: "Adenine",
  C: "Cytosine",
  G: "Guanine",
  T: "Thymine",
  U: "Uracil",
} as const;

/** DNA base letters */
const DNA_LETTERS = ["A", "C", "G", "T"] as const;
/** RNA base letters */
const RNA_LETTERS = ["A", "C", "G", "U"] as const;

// ============ DERIVED TYPES ============

/**
 * Single-letter base code.
 * Backward compatible with existing code that expects string literals.
 */
type BaseLetter = keyof typeof BASES;

/** DNA base letters only */
type DNABaseLetter = (typeof DNA_LETTERS)[number];
/** RNA base letters only */
type RNABaseLetter = (typeof RNA_LETTERS)[number];

/** Full nucleotide base names */
type BaseName = (typeof BASES)[BaseLetter];

/** Map from letter to its full name */
type BaseNameFor<L extends BaseLetter> = (typeof BASES)[L];

/**
 * Generic nucleotide base with letter and derived name.
 */
type NucleotideBase<L extends BaseLetter> = {
  readonly letter: L;
  readonly name: BaseNameFor<L>;
};

/** Nucleic acid type discriminator */
type NucleicAcidType = "DNA" | "RNA";

/** Map nucleic acid type to its valid letters */
type LettersFor<T extends NucleicAcidType> = T extends "DNA"
  ? DNABaseLetter
  : RNABaseLetter;

/**
 * Discriminated union for nucleotide bases.
 * Full object representation with type, letter, and name.
 */
type BaseObject<T extends NucleicAcidType = NucleicAcidType> = {
  readonly type: T;
  readonly letter: LettersFor<T>;
  readonly name: BaseNameFor<LettersFor<T>>;
};

/** DNA base object */
type DNABase = BaseObject<"DNA">;
/** RNA base object */
type RNABase = BaseObject<"RNA">;

// ============ RUNTIME HELPERS ============

/**
 * Create a base object with proper typing.
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

/** Type guard for DNA bases */
const isDNA = (base: BaseObject): base is DNABase => base.type === "DNA";
/** Type guard for RNA bases */
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
