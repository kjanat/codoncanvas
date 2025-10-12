/**
 * @fileoverview Type definitions for CodonCanvas genetic programming language.
 * Defines core types, opcodes, VM state, and codon-to-opcode mapping.
 */

/**
 * Valid DNA/RNA base character.
 * - DNA: Adenine, Cytosine, Guanine, Thymine
 * - RNA: Adenine, Cytosine, Guanine, Uracil
 * Note: U and T are treated as synonyms (both map to same codons).
 */
export type Base = 'A' | 'C' | 'G' | 'T' | 'U';

/**
 * Three-character DNA/RNA triplet (codon).
 * Each codon maps to an executable opcode instruction.
 * Supports both DNA (T) and RNA (U) notation.
 * @example 'ATG', 'GGA', 'TAA' (DNA) or 'AUG', 'GGA', 'UAA' (RNA)
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
  severity: 'error' | 'warning' | 'info';
  /** Optional suggested fix for linter UI */
  fix?: string;
}

/**
 * VM instruction opcodes.
 * Each opcode represents a drawing, transform, or stack operation.
 *
 * Families (synonymous codons map to same opcode):
 * - Control: START, STOP (program flow)
 * - Drawing: CIRCLE, RECT, LINE, TRIANGLE, ELLIPSE (primitives)
 * - Transform: TRANSLATE, ROTATE, SCALE, COLOR (state changes)
 * - Stack: PUSH, DUP, POP, SWAP (data manipulation)
 * - Arithmetic: ADD, SUB, MUL, DIV (computational operations)
 * - Control: LOOP (iteration)
 * - Utility: NOP, NOISE, SAVE_STATE, RESTORE_STATE (special operations)
 */
export enum Opcode {
  START,
  STOP,
  CIRCLE,
  RECT,
  LINE,
  TRIANGLE,
  ELLIPSE,
  TRANSLATE,
  ROTATE,
  SCALE,
  COLOR,
  PUSH,
  DUP,
  POP,
  SWAP,
  NOP,
  SAVE_STATE,
  RESTORE_STATE,
  ADD,
  SUB,
  MUL,
  DIV,
  LOOP,
  EQ,   // Comparison: equal
  LT,   // Comparison: less than
}

/**
 * Virtual Machine execution state.
 * Captures complete VM state for snapshot/restore and timeline scrubbing.
 */
export interface VMState {
  // Drawing state
  /** Current drawing position (canvas coordinates) */
  position: { x: number; y: number };
  /** Current rotation in degrees (0 = right/east) */
  rotation: number;
  /** Current scale factor (1.0 = normal) */
  scale: number;
  /** Current color in HSL (hue: 0-360, saturation: 0-100, lightness: 0-100) */
  color: { h: number; s: number; l: number };

  // Execution state
  /** Value stack for operations (numeric literals and intermediate values) */
  stack: number[];
  /** Current instruction index in token array */
  instructionPointer: number;
  /** Saved state stack for SAVE_STATE opcode (enables nested transformations) */
  stateStack: VMState[];

  // Metadata
  /** Total instructions executed (for sandboxing/timeout) */
  instructionCount: number;
  /** Random seed for NOISE opcode (deterministic rendering) */
  seed: number;
  /** Last executed opcode (for MIDI export and debugging) */
  lastOpcode?: Opcode;
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
  'ATG': Opcode.START,
  'TAA': Opcode.STOP,
  'TAG': Opcode.STOP,
  'TGA': Opcode.STOP,

  // Drawing Primitives
  'GGA': Opcode.CIRCLE, 'GGC': Opcode.CIRCLE, 'GGG': Opcode.CIRCLE, 'GGT': Opcode.CIRCLE,
  'CCA': Opcode.RECT, 'CCC': Opcode.RECT, 'CCG': Opcode.RECT, 'CCT': Opcode.RECT,
  'AAA': Opcode.LINE, 'AAC': Opcode.LINE, 'AAG': Opcode.LINE, 'AAT': Opcode.LINE,
  'GCA': Opcode.TRIANGLE, 'GCC': Opcode.TRIANGLE, 'GCG': Opcode.TRIANGLE, 'GCT': Opcode.TRIANGLE,
  'GTA': Opcode.ELLIPSE, 'GTC': Opcode.ELLIPSE, 'GTG': Opcode.ELLIPSE, 'GTT': Opcode.ELLIPSE,

  // Transform Operations
  'ACA': Opcode.TRANSLATE, 'ACC': Opcode.TRANSLATE, 'ACG': Opcode.TRANSLATE, 'ACT': Opcode.TRANSLATE,
  'AGA': Opcode.ROTATE, 'AGC': Opcode.ROTATE, 'AGG': Opcode.ROTATE, 'AGT': Opcode.ROTATE,
  'CGA': Opcode.SCALE, 'CGC': Opcode.SCALE, 'CGG': Opcode.SCALE, 'CGT': Opcode.SCALE,
  'TTA': Opcode.COLOR, 'TTC': Opcode.COLOR, 'TTG': Opcode.COLOR, 'TTT': Opcode.COLOR,

  // Stack Operations
  'GAA': Opcode.PUSH, 'GAG': Opcode.PUSH, 'GAC': Opcode.PUSH, 'GAT': Opcode.PUSH,
  'ATA': Opcode.DUP, 'ATC': Opcode.DUP, 'ATT': Opcode.DUP,

  // Utility
  'CAC': Opcode.NOP,
  'TAC': Opcode.POP, 'TAT': Opcode.POP, 'TGC': Opcode.POP,

  // Advanced Operations
  'TGG': Opcode.SWAP, 'TGT': Opcode.SWAP,
  'TCA': Opcode.SAVE_STATE, 'TCC': Opcode.SAVE_STATE,
  'TCG': Opcode.RESTORE_STATE, 'TCT': Opcode.RESTORE_STATE,

  // Arithmetic Operations
  'CTG': Opcode.ADD,
  'CAG': Opcode.SUB,
  'CTT': Opcode.MUL,
  'CAT': Opcode.DIV,

  // Comparison Operations
  'CTA': Opcode.EQ,  // Equality comparison [a, b] → [1 if a==b else 0]
  'CTC': Opcode.LT,  // Less than comparison [a, b] → [1 if a<b else 0]

  // Control Flow Operations
  'CAA': Opcode.LOOP,
};
