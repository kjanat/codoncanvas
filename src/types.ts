// Base types
export type Base = 'A' | 'C' | 'G' | 'T';
export type Codon = `${Base}${Base}${Base}`;

export interface CodonToken {
  text: Codon;
  position: number;  // Character offset in source
  line: number;      // Line number (1-indexed)
}

export interface ParseError {
  message: string;
  position: number;
  severity: 'error' | 'warning' | 'info';
  fix?: string;      // Suggested fix
}

// Opcode enumeration
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
  NOISE,
  SAVE_STATE,
}

// VM State
export interface VMState {
  // Drawing state
  position: { x: number; y: number };
  rotation: number;      // degrees, 0 = right
  scale: number;
  color: { h: number; s: number; l: number };

  // Execution state
  stack: number[];
  instructionPointer: number;
  stateStack: VMState[];  // For SAVE_STATE/RESTORE_STATE

  // Metadata
  instructionCount: number;
  seed: number;
}

// Codon to Opcode mapping
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
  'CAA': Opcode.NOP, 'CAC': Opcode.NOP, 'CAG': Opcode.NOP, 'CAT': Opcode.NOP,
  'TAC': Opcode.POP, 'TAT': Opcode.POP, 'TGC': Opcode.POP,

  // Advanced Operations
  'TGG': Opcode.SWAP, 'TGT': Opcode.SWAP,
  'CTA': Opcode.NOISE, 'CTC': Opcode.NOISE, 'CTG': Opcode.NOISE, 'CTT': Opcode.NOISE,
  'TCA': Opcode.SAVE_STATE, 'TCC': Opcode.SAVE_STATE, 'TCG': Opcode.SAVE_STATE, 'TCT': Opcode.SAVE_STATE,
};
