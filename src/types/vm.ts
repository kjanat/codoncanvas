/**
 * @fileoverview Virtual Machine types for CodonCanvas execution
 *
 * Defines the instruction set (opcodes) and execution state for the
 * stack-based CodonCanvas VM. The VM executes DNA-like codon programs
 * with drawing primitives, transforms, and control flow.
 *
 * @module types/vm
 */

import type { HSLColor, Point2D } from "@/types/geometric";

/**
 * VM instruction opcodes.
 *
 * Each opcode represents a drawing, transform, or stack operation.
 * Multiple codons (synonymous) can map to the same opcode, demonstrating
 * genetic redundancy - a key educational concept.
 *
 * **Opcode Families:**
 * - **Control:** START, STOP (program flow boundaries)
 * - **Drawing:** CIRCLE, RECT, LINE, TRIANGLE, ELLIPSE (shape primitives)
 * - **Transform:** TRANSLATE, ROTATE, SCALE, COLOR (state modifiers)
 * - **Stack:** PUSH, DUP, POP, SWAP (data manipulation)
 * - **Arithmetic:** ADD, SUB, MUL, DIV (math operations)
 * - **Comparison:** EQ, LT (conditional logic)
 * - **Iteration:** LOOP (repeat instructions)
 * - **State:** SAVE_STATE, RESTORE_STATE (transform checkpoints)
 * - **Utility:** NOP, NOISE (no-op and visual effects)
 *
 * @see CODON_MAP for codon-to-opcode mapping
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

// ============================================================================
// Opcode Category Types (compile-time grouping)
// ============================================================================

/** Control flow opcodes */
export type ControlOpcode = Opcode.START | Opcode.STOP | Opcode.LOOP;

/** Drawing primitive opcodes */
export type DrawingOpcode =
  | Opcode.CIRCLE
  | Opcode.RECT
  | Opcode.LINE
  | Opcode.TRIANGLE
  | Opcode.ELLIPSE;

/** Transform/state modifier opcodes */
export type TransformOpcode =
  | Opcode.TRANSLATE
  | Opcode.ROTATE
  | Opcode.SCALE
  | Opcode.COLOR;

/** Stack manipulation opcodes */
export type StackOpcode = Opcode.PUSH | Opcode.DUP | Opcode.POP | Opcode.SWAP;

/** Arithmetic opcodes */
export type ArithmeticOpcode =
  | Opcode.ADD
  | Opcode.SUB
  | Opcode.MUL
  | Opcode.DIV;

/** Comparison opcodes */
export type ComparisonOpcode = Opcode.EQ | Opcode.LT;

/** State save/restore opcodes */
export type StateOpcode = Opcode.SAVE_STATE | Opcode.RESTORE_STATE;

/** Utility opcodes */
export type UtilityOpcode = Opcode.NOP;

// ============================================================================
// Opcode Category Arrays (runtime checking)
// ============================================================================

/** All control flow opcodes */
export const CONTROL_OPCODES = [
  Opcode.START,
  Opcode.STOP,
  Opcode.LOOP,
] as const satisfies readonly ControlOpcode[];

/** All drawing primitive opcodes */
export const DRAWING_OPCODES = [
  Opcode.CIRCLE,
  Opcode.RECT,
  Opcode.LINE,
  Opcode.TRIANGLE,
  Opcode.ELLIPSE,
] as const satisfies readonly DrawingOpcode[];

/** All transform opcodes */
export const TRANSFORM_OPCODES = [
  Opcode.TRANSLATE,
  Opcode.ROTATE,
  Opcode.SCALE,
  Opcode.COLOR,
] as const satisfies readonly TransformOpcode[];

/** All stack manipulation opcodes */
export const STACK_OPCODES = [
  Opcode.PUSH,
  Opcode.DUP,
  Opcode.POP,
  Opcode.SWAP,
] as const satisfies readonly StackOpcode[];

/** All arithmetic opcodes */
export const ARITHMETIC_OPCODES = [
  Opcode.ADD,
  Opcode.SUB,
  Opcode.MUL,
  Opcode.DIV,
] as const satisfies readonly ArithmeticOpcode[];

// ============================================================================
// Type Guards for Opcode Categories
// ============================================================================

/** Type guard for control opcodes */
export function isControlOpcode(op: Opcode): op is ControlOpcode {
  return (CONTROL_OPCODES as readonly Opcode[]).includes(op);
}

/** Type guard for drawing opcodes */
export function isDrawingOpcode(op: Opcode): op is DrawingOpcode {
  return (DRAWING_OPCODES as readonly Opcode[]).includes(op);
}

/** Type guard for transform opcodes */
export function isTransformOpcode(op: Opcode): op is TransformOpcode {
  return (TRANSFORM_OPCODES as readonly Opcode[]).includes(op);
}

/** Type guard for stack opcodes */
export function isStackOpcode(op: Opcode): op is StackOpcode {
  return (STACK_OPCODES as readonly Opcode[]).includes(op);
}

/** Type guard for arithmetic opcodes */
export function isArithmeticOpcode(op: Opcode): op is ArithmeticOpcode {
  return (ARITHMETIC_OPCODES as readonly Opcode[]).includes(op);
}

// ============================================================================
// Stack Requirements (for validation)
// ============================================================================

/**
 * Number of stack values required by each opcode.
 * Used for compile-time and runtime validation.
 */
export const OPCODE_STACK_REQUIREMENTS: Record<Opcode, number> = {
  [Opcode.START]: 0,
  [Opcode.STOP]: 0,
  [Opcode.CIRCLE]: 1,
  [Opcode.RECT]: 2,
  [Opcode.LINE]: 1,
  [Opcode.TRIANGLE]: 1,
  [Opcode.ELLIPSE]: 2,
  [Opcode.TRANSLATE]: 2,
  [Opcode.ROTATE]: 1,
  [Opcode.SCALE]: 1,
  [Opcode.COLOR]: 3,
  [Opcode.PUSH]: 0,
  [Opcode.DUP]: 1,
  [Opcode.POP]: 1,
  [Opcode.SWAP]: 2,
  [Opcode.NOP]: 0,
  [Opcode.SAVE_STATE]: 0,
  [Opcode.RESTORE_STATE]: 0,
  [Opcode.ADD]: 2,
  [Opcode.SUB]: 2,
  [Opcode.MUL]: 2,
  [Opcode.DIV]: 2,
  [Opcode.LOOP]: 2,
  [Opcode.EQ]: 2,
  [Opcode.LT]: 2,
} as const;

/**
 * Virtual Machine execution state snapshot.
 *
 * Captures complete VM state for checkpoint/restore and timeline scrubbing.
 * Immutable snapshots enable frame-by-frame playback, debugging, and
 * the timeline scrubber UI.
 *
 * **Value Constraints:**
 * - Stack values are 6-bit integers (0-63 range, base-4 encoded from codons)
 * - Rotation is unbounded (accumulates across multiple ROTATE operations)
 * - Scale is multiplicative (starts at 1.0, compounds with each SCALE op)
 * - Color uses HSL: hue 0-360°, saturation/lightness 0-100%
 *
 * **State Management:**
 * - Use {@link CodonVM.snapshot} to create immutable copies
 * - Use {@link CodonVM.restore} to rewind to a previous state
 * - The stateStack enables nested transformations via SAVE_STATE/RESTORE_STATE
 *
 * @example
 * ```typescript
 * const vm = new CodonVM(renderer);
 * const states = vm.run(tokens); // Array of snapshots, one per instruction
 * vm.restore(states[5]);         // Rewind to instruction 5
 * ```
 */
export interface VMState {
  // Drawing state
  /** Current drawing position in canvas pixel coordinates */
  position: Point2D;
  /** Current rotation in degrees (unbounded, 0 = right/east, 90 = down) */
  rotation: number;
  /** Current scale multiplier (1.0 = normal, >1 = larger, <1 = smaller) */
  scale: number;
  /** Current fill/stroke color in HSL (hue: 0-360°, sat/light: 0-100%) */
  color: HSLColor;

  // Execution state
  /** Value stack (each value is 0-63, base-4 encoded from codon literals) */
  stack: number[];
  /** Current instruction index in token array (0-based) */
  instructionPointer: number;
  /** Saved state stack for SAVE_STATE/RESTORE_STATE (nested transforms) */
  stateStack: VMState[];

  // Metadata
  /** Total instructions executed (for sandboxing, default limit: 10,000) */
  instructionCount: number;
  /** Random seed for NOISE opcode (ensures deterministic rendering) */
  seed: number;
  /** Last executed opcode (used by MIDI exporter and debugger) */
  lastOpcode?: Opcode;
}
