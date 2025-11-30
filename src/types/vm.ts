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
  NOISE, // Visual texture: random dots in circular area
  SETPOS, // Absolute positioning: set position directly
}

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
