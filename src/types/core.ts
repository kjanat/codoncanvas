/**
 * @fileoverview Core interface declarations for CodonCanvas
 * @module types/core
 */

import type { CodonToken, ParseError } from "@/types/genetics";
import type { Point2D } from "@/types/geometric";
import type { Opcode, VMState } from "@/types/vm";

/**
 * Transform state for VM tracking.
 */
export interface TransformState extends Point2D {
  rotation: number;
  scale: number;
}

/**
 * Renderer interface for CodonCanvas drawing operations.
 */
export interface Renderer {
  readonly width: number;
  readonly height: number;
  clear(): void;
  circle(radius: number): void;
  rect(width: number, height: number): void;
  line(length: number): void;
  triangle(size: number): void;
  ellipse(rx: number, ry: number): void;
  noise(seed: number, intensity: number): void;
  translate(dx: number, dy: number): void;
  rotate(degrees: number): void;
  scale(factor: number): void;
  setColor(h: number, s: number, l: number): void;
  setPosition(x: number, y: number): void;
  setRotation(degrees: number): void;
  setScale(scale: number): void;
  getCurrentTransform(): TransformState;
  toDataURL(): string;
}

/**
 * Lexer interface for CodonCanvas genome parsing.
 *
 * Responsible for tokenizing DNA/RNA triplets and validating genome structure.
 * Implementations should normalize RNA (U) to DNA (T) notation.
 */
export interface Lexer {
  /**
   * Tokenize source genome into codons.
   *
   * @param source - Raw genome string containing DNA/RNA bases (A/C/G/T/U)
   *   with optional whitespace and comments (`;` to end of line)
   * @returns Array of codon tokens with position and line information
   * @throws {Error} If invalid characters found (non-ACGTU after stripping whitespace)
   * @throws {Error} If source length not divisible by 3 (incomplete codon)
   */
  tokenize(source: string): CodonToken[];

  /**
   * Validate reading frame alignment.
   *
   * Checks for whitespace breaks within triplets that would disrupt the reading frame.
   * Does NOT throw; returns warnings for formatting issues.
   *
   * @param source - Raw genome string to validate
   * @returns Array of frame alignment warnings (never errors)
   */
  validateFrame(source: string): ParseError[];

  /**
   * Validate structural integrity of tokenized genome.
   *
   * Checks for:
   * - START codon (ATG) at beginning
   * - STOP codon (TAA/TAG/TGA) at end
   * - Unknown/unmapped codons
   * - Code after STOP (unreachable)
   *
   * @param tokens - Array of codon tokens to validate
   * @returns Array of structural errors and warnings
   */
  validateStructure(tokens: CodonToken[]): ParseError[];
}

/**
 * Virtual Machine interface for CodonCanvas execution.
 * Stack-based VM with drawing primitives and transform state.
 */
export interface VM {
  /** Current VM execution state (position, rotation, scale, color, stack) */
  state: VMState;
  /** Renderer for drawing operations */
  renderer: Renderer;

  /**
   * Execute a single opcode instruction.
   * @param opcode - The operation to execute
   * @param codon - The codon string (used for PUSH literal decoding)
   * @throws Error on stack underflow or invalid operations
   */
  execute(opcode: Opcode, codon: string): void;

  /**
   * Run entire genome program.
   * @param tokens - Array of codon tokens to execute
   * @returns Array of VM state snapshots (one per instruction) for timeline playback
   * @throws Error on instruction limit exceeded or execution errors
   */
  run(tokens: CodonToken[]): VMState[];

  /**
   * Reset VM to initial state.
   * Clears stack, resets position/rotation/scale/color, zeroes instruction counter.
   */
  reset(): void;

  /**
   * Create snapshot of current VM state.
   * @returns Deep copy of current state for rewind/step-through
   */
  snapshot(): VMState;

  /**
   * Restore VM from a previous snapshot.
   * @param state - Previously captured VM state
   */
  restore(state: VMState): void;
}
