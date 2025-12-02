/**
 * @fileoverview Discriminated union types for VM execution states
 *
 * Instead of a single VMState interface, we model the VM as a state machine
 * with distinct states. This enables:
 * - Compile-time enforcement of valid state transitions
 * - Exhaustive switch handling (TypeScript errors if you miss a case)
 * - Clearer separation of state-specific properties
 *
 * @example
 * ```typescript
 * function handleResult(result: VMExecutionResult) {
 *   switch (result.status) {
 *     case "running":
 *       console.log(`At instruction ${result.state.instructionPointer}`);
 *       break;
 *     case "halted":
 *       console.log(`Completed after ${result.instructionsExecuted} ops`);
 *       break;
 *     case "error":
 *       console.error(result.error.message);
 *       break;
 *     // TypeScript error if we forget a case!
 *   }
 * }
 * ```
 *
 * @module types/vm-states
 */

import type { Degrees, PositiveNumber, StackValue } from "./branded";
import type { Codon, CodonToken } from "./genetics";
import type { HSLColor, Point2D } from "./geometric";
import type { Opcode } from "./vm";

// ============================================================================
// Core VM State (immutable snapshot)
// ============================================================================

/**
 * Immutable VM state snapshot.
 * Used for timeline scrubbing, debugging, and state restoration.
 *
 * All properties are readonly to enforce immutability.
 * Create new states via spread: `{ ...state, rotation: newRotation }`
 */
export interface VMStateSnapshot {
  // Drawing state
  readonly position: Readonly<Point2D>;
  readonly rotation: Degrees;
  readonly scale: PositiveNumber;
  readonly color: Readonly<HSLColor>;

  // Execution state
  readonly stack: readonly StackValue[];
  readonly instructionPointer: number;
  readonly stateStack: readonly VMStateSnapshot[];

  // Metadata
  readonly instructionCount: number;
  readonly seed: number;
  readonly lastOpcode?: Opcode;
}

// ============================================================================
// Execution Result Discriminated Union
// ============================================================================

/**
 * VM is actively executing instructions.
 * Transitions to: Running | Halted | Error
 */
export interface VMRunning {
  readonly status: "running";
  /** Current execution snapshot */
  readonly state: VMStateSnapshot;
  /** Token currently being executed */
  readonly currentToken: CodonToken;
}

/**
 * VM has completed execution normally (reached STOP or end of program).
 */
export interface VMHalted {
  readonly status: "halted";
  /** Final state snapshot */
  readonly state: VMStateSnapshot;
  /** Total instructions executed */
  readonly instructionsExecuted: number;
  /** Execution time in milliseconds */
  readonly executionTimeMs: number;
}

/**
 * VM encountered an error during execution.
 */
export interface VMError {
  readonly status: "error";
  /** State at time of error */
  readonly state: VMStateSnapshot;
  /** Error details */
  readonly error: VMExecutionError;
  /** Token that caused the error (if applicable) */
  readonly faultingToken?: CodonToken;
}

/**
 * VM execution is paused (for debugging/stepping).
 */
export interface VMPaused {
  readonly status: "paused";
  /** State when paused */
  readonly state: VMStateSnapshot;
  /** Reason for pause */
  readonly reason: PauseReason;
}

/** Discriminated union of all VM execution states */
export type VMExecutionResult = VMRunning | VMHalted | VMError | VMPaused;

// ============================================================================
// Error Types
// ============================================================================

/** Base error structure */
interface BaseVMError {
  readonly message: string;
  readonly position?: number;
}

/** Stack underflow - tried to pop from empty stack */
export interface StackUnderflowError extends BaseVMError {
  readonly type: "stack_underflow";
  readonly opcode: Opcode;
  readonly requiredValues: number;
  readonly availableValues: number;
}

/** Stack overflow - exceeded maximum stack depth */
export interface StackOverflowError extends BaseVMError {
  readonly type: "stack_overflow";
  readonly maxDepth: number;
}

/** Instruction limit exceeded (infinite loop protection) */
export interface InstructionLimitError extends BaseVMError {
  readonly type: "instruction_limit";
  readonly limit: number;
  readonly executed: number;
}

/** Invalid opcode encountered */
export interface InvalidOpcodeError extends BaseVMError {
  readonly type: "invalid_opcode";
  readonly codon: Codon;
}

/** Division by zero */
export interface DivisionByZeroError extends BaseVMError {
  readonly type: "division_by_zero";
}

/** State stack underflow (RESTORE_STATE without SAVE_STATE) */
export interface StateStackUnderflowError extends BaseVMError {
  readonly type: "state_stack_underflow";
}

/** Discriminated union of all VM errors */
export type VMExecutionError =
  | StackUnderflowError
  | StackOverflowError
  | InstructionLimitError
  | InvalidOpcodeError
  | DivisionByZeroError
  | StateStackUnderflowError;

// ============================================================================
// Pause Reasons
// ============================================================================

/** Pause triggered by breakpoint */
export interface BreakpointPause {
  readonly type: "breakpoint";
  readonly breakpointId: string;
}

/** Pause triggered by step command */
export interface StepPause {
  readonly type: "step";
  readonly stepType: "into" | "over" | "out";
}

/** Pause triggered by user request */
export interface UserPause {
  readonly type: "user";
}

/** Discriminated union of pause reasons */
export type PauseReason = BreakpointPause | StepPause | UserPause;

// ============================================================================
// Type Guards
// ============================================================================

/** Type guard for running state */
export function isRunning(result: VMExecutionResult): result is VMRunning {
  return result.status === "running";
}

/** Type guard for halted state */
export function isHalted(result: VMExecutionResult): result is VMHalted {
  return result.status === "halted";
}

/** Type guard for error state */
export function isError(result: VMExecutionResult): result is VMError {
  return result.status === "error";
}

/** Type guard for paused state */
export function isPaused(result: VMExecutionResult): result is VMPaused {
  return result.status === "paused";
}

// ============================================================================
// Exhaustiveness Helper
// ============================================================================

/**
 * Helper for exhaustive switch statements.
 * TypeScript will error if any case is unhandled.
 *
 * @example
 * ```typescript
 * function handle(result: VMExecutionResult): string {
 *   switch (result.status) {
 *     case "running": return "...";
 *     case "halted": return "...";
 *     case "error": return "...";
 *     case "paused": return "...";
 *     default: return assertNever(result);
 *   }
 * }
 * ```
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

// ============================================================================
// State Factory Functions
// ============================================================================

/**
 * Creates a VMRunning result.
 */
export function running(
  state: VMStateSnapshot,
  currentToken: CodonToken,
): VMRunning {
  return { status: "running", state, currentToken };
}

/**
 * Creates a VMHalted result.
 */
export function halted(
  state: VMStateSnapshot,
  instructionsExecuted: number,
  executionTimeMs: number,
): VMHalted {
  return { status: "halted", state, instructionsExecuted, executionTimeMs };
}

/**
 * Creates a VMError result.
 */
export function error(
  state: VMStateSnapshot,
  error: VMExecutionError,
  faultingToken?: CodonToken,
): VMError {
  return { status: "error", state, error, faultingToken };
}

/**
 * Creates a VMPaused result.
 */
export function paused(state: VMStateSnapshot, reason: PauseReason): VMPaused {
  return { status: "paused", state, reason };
}
