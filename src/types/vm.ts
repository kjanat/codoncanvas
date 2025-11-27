import type { HSLColor, Point2D } from "./geometric";

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
  EQ, // Comparison: equal
  LT, // Comparison: less than
}

/**
 * Virtual Machine execution state.
 * Captures complete VM state for snapshot/restore and timeline scrubbing.
 */
export interface VMState {
  // Drawing state
  /** Current drawing position (canvas coordinates) */
  position: Point2D;
  /** Current rotation in degrees (0 = right/east) */
  rotation: number;
  /** Current scale factor (1.0 = normal) */
  scale: number;
  /** Current color in HSL (hue: 0-360, saturation: 0-100, lightness: 0-100) */
  color: HSLColor;

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
