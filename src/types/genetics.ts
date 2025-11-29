import type { Severity } from "@/types/common";
import { Opcode } from "@/types/vm";

/**
 * Valid DNA/RNA base character.
 * - DNA: Adenine, Cytosine, Guanine, Thymine
 * - RNA: Adenine, Cytosine, Guanine, Uracil
 * Note: U and T are treated as synonyms (both map to same codons).
 */
export type Base = "A" | "C" | "G" | "T" | "U";

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
