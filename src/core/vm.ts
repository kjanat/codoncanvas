import type { Renderer } from "@/core";
import {
  CODON_MAP,
  type Codon,
  type CodonToken,
  DNA_BASE_TO_INDEX,
  type DNABaseLetter,
  Opcode,
  type VMState,
} from "@/types";

/**
 * Stack values are 6-bit (0-63 range).
 * This is the maximum value used for normalization to coordinate/color spaces.
 */
const STACK_VALUE_RANGE = 64;

/**
 * Maximum degrees in a full circle for hue calculations.
 * Hue values from stack (0-63) are mapped to 0-360 degrees.
 */
const HUE_DEGREES = 360;

/**
 * Percentage scale (0-100) for lightness and saturation.
 * Stack values (0-63) are mapped to 0-100% range.
 */
const PERCENT_SCALE = 100;

/**
 * Scaling factor for general-purpose transformations.
 * Stack values are divided by this to produce reasonable scale multipliers.
 */
const SCALE_DIVISOR = 32;

/**
 * Default maximum instruction count to prevent infinite loops.
 * Programs exceeding this limit will throw an error.
 */
const DEFAULT_MAX_INSTRUCTIONS = 10000;

/**
 * Base-4 encoding weight for first digit position (4^2).
 * Used in decoding three-letter codons to 0-63 numeric literals.
 */
const BASE4_DIGIT1_WEIGHT = 16;

/**
 * Base-4 encoding weight for second digit position (4^1).
 * Used in decoding three-letter codons to 0-63 numeric literals.
 */
const BASE4_DIGIT2_WEIGHT = 4;

/**
 * Number of PUSH instructions used for LOOP parameters.
 * LOOP expects two values on stack (instructionCount, loopCount),
 * so we skip the last 2 history entries when replaying.
 */
const LOOP_PARAMETER_COUNT = 2;

/**
 * Boolean true value for comparison operations (EQ, LT).
 */
const BOOLEAN_TRUE = 1;

/**
 * Boolean false value for comparison operations (EQ, LT).
 */
const BOOLEAN_FALSE = 0;

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

/**
 * CodonCanvas virtual machine implementation.
 * Executes DNA-like codon programs with stack-based graphics operations.
 *
 * Features:
 * - Stack machine with numeric values
 * - Drawing primitives (CIRCLE, RECT, LINE, TRIANGLE, ELLIPSE)
 * - Transform operations (TRANSLATE, ROTATE, SCALE, COLOR)
 * - Base-4 numeric literal encoding (0-63 range)
 * - Sandboxing with instruction limit (default: 10,000)
 * - State snapshot/restore for timeline scrubbing
 *
 * @example
 * ```typescript
 * const canvas = document.querySelector('canvas');
 * const renderer = new Canvas2DRenderer(canvas);
 * const vm = new CodonVM(renderer);
 *
 * const lexer = new CodonLexer();
 * const tokens = lexer.tokenize('ATG GAA CCC GGA TAA'); // PUSH 21, CIRCLE
 * const states = vm.run(tokens); // Execute and get state history
 * ```
 */
export class CodonVM implements VM {
  state: VMState;
  renderer: Renderer;
  private maxInstructions: number;
  private instructionHistory: {
    opcode: Opcode;
    codon: Codon;
    pushValue?: number;
  }[] = [];

  constructor(renderer: Renderer, maxInstructions?: number) {
    this.renderer = renderer;

    const limit = maxInstructions ?? DEFAULT_MAX_INSTRUCTIONS;
    if (!Number.isFinite(limit) || limit < 1 || !Number.isInteger(limit)) {
      throw new Error(
        `maxInstructions must be a positive integer, got: ${maxInstructions}`,
      );
    }
    this.maxInstructions = limit;

    this.state = this.createInitialState();
  }

  private createInitialState(): VMState {
    return {
      position: { x: this.renderer.width / 2, y: this.renderer.height / 2 },
      rotation: 0,
      scale: 1,
      color: { h: 0, s: 0, l: 0 },
      stack: [],
      instructionPointer: 0,
      stateStack: [],
      instructionCount: 0,
      seed: Date.now(),
    };
  }

  reset(): void {
    this.state = this.createInitialState();
    this.renderer.clear();
    this.instructionHistory = [];
  }

  snapshot(): VMState {
    return JSON.parse(JSON.stringify(this.state));
  }

  restore(state: VMState): void {
    this.state = JSON.parse(JSON.stringify(state));
  }

  private pop(): number {
    const value = this.state.stack.pop();
    if (value === undefined) {
      throw new Error(
        `Stack underflow at instruction ${this.state.instructionPointer}`,
      );
    }
    return value;
  }

  private push(value: number): void {
    this.state.stack.push(value);
  }

  /**
   * Decode base-4 numeric literal from codon
   */
  private decodeNumericLiteral(codon: string): number {
    const d1 = DNA_BASE_TO_INDEX[codon[0] as DNABaseLetter] ?? 0;
    const d2 = DNA_BASE_TO_INDEX[codon[1] as DNABaseLetter] ?? 0;
    const d3 = DNA_BASE_TO_INDEX[codon[2] as DNABaseLetter] ?? 0;
    return d1 * BASE4_DIGIT1_WEIGHT + d2 * BASE4_DIGIT2_WEIGHT + d3;
  }

  /**
   * Scale value from 0-63 range to canvas coordinates
   */
  private scaleValue(value: number): number {
    return (value / STACK_VALUE_RANGE) * this.renderer.width;
  }

  execute(opcode: Opcode, _codon: string): void {
    this.state.instructionCount++;

    if (this.state.instructionCount > this.maxInstructions) {
      throw new Error(
        `Instruction limit exceeded (max ${this.maxInstructions})`,
      );
    }

    // Track executed opcode for MIDI export
    this.state.lastOpcode = opcode;

    switch (opcode) {
      case Opcode.CIRCLE:
      case Opcode.RECT:
      case Opcode.LINE:
      case Opcode.TRIANGLE:
      case Opcode.ELLIPSE:
        this.executeDrawOp(opcode);
        break;

      case Opcode.TRANSLATE:
      case Opcode.ROTATE:
      case Opcode.SCALE:
      case Opcode.COLOR:
        this.executeTransformOp(opcode);
        break;

      case Opcode.ADD:
      case Opcode.MUL:
      case Opcode.SUB:
      case Opcode.DIV:
        this.executeMathOp(opcode);
        break;

      case Opcode.DUP:
      case Opcode.POP:
      case Opcode.SWAP:
        this.executeStackOp(opcode);
        break;

      case Opcode.SAVE_STATE:
      case Opcode.RESTORE_STATE:
        this.executeStateOp(opcode);
        break;

      case Opcode.LOOP:
        this.executeLoopOp();
        break;

      case Opcode.EQ:
      case Opcode.LT:
        this.executeCompareOp(opcode);
        break;

      case Opcode.START:
      case Opcode.STOP:
      case Opcode.PUSH:
      case Opcode.NOP:
        // No operation or handled elsewhere
        break;

      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }

  private executeDrawOp(opcode: Opcode): void {
    switch (opcode) {
      case Opcode.CIRCLE: {
        const radius = this.scaleValue(this.pop());
        this.renderer.circle(radius);
        break;
      }
      case Opcode.RECT: {
        const height = this.scaleValue(this.pop());
        const width = this.scaleValue(this.pop());
        this.renderer.rect(width, height);
        break;
      }
      case Opcode.LINE: {
        const length = this.scaleValue(this.pop());
        this.renderer.line(length);
        break;
      }
      case Opcode.TRIANGLE: {
        const size = this.scaleValue(this.pop());
        this.renderer.triangle(size);
        break;
      }
      case Opcode.ELLIPSE: {
        const ry = this.scaleValue(this.pop());
        const rx = this.scaleValue(this.pop());
        this.renderer.ellipse(rx, ry);
        break;
      }
    }
  }

  private executeTransformOp(opcode: Opcode): void {
    switch (opcode) {
      case Opcode.TRANSLATE: {
        const dy = this.scaleValue(this.pop());
        const dx = this.scaleValue(this.pop());
        this.renderer.translate(dx, dy);
        const transform = this.renderer.getCurrentTransform();
        this.state.position = { x: transform.x, y: transform.y };
        break;
      }
      case Opcode.ROTATE: {
        const degrees = this.pop();
        this.renderer.rotate(degrees);
        this.state.rotation = this.renderer.getCurrentTransform().rotation;
        break;
      }
      case Opcode.SCALE: {
        const factor = this.pop() / SCALE_DIVISOR;
        this.renderer.scale(factor);
        this.state.scale = this.renderer.getCurrentTransform().scale;
        break;
      }
      case Opcode.COLOR: {
        const l = this.pop() * (PERCENT_SCALE / STACK_VALUE_RANGE);
        const s = this.pop() * (PERCENT_SCALE / STACK_VALUE_RANGE);
        const h = this.pop() * (HUE_DEGREES / STACK_VALUE_RANGE);
        this.renderer.setColor(h, s, l);
        this.state.color = { h, s, l };
        break;
      }
    }
  }

  private executeMathOp(opcode: Opcode): void {
    const b = this.pop();
    const a = this.pop();
    switch (opcode) {
      case Opcode.ADD:
        this.push(a + b);
        break;
      case Opcode.MUL:
        this.push(a * b);
        break;
      case Opcode.SUB:
        this.push(a - b);
        break;
      case Opcode.DIV:
        if (b === 0) {
          throw new Error(
            `Division by zero at instruction ${this.state.instructionPointer}`,
          );
        }
        this.push(Math.floor(a / b));
        break;
    }
  }

  private executeStackOp(opcode: Opcode): void {
    switch (opcode) {
      case Opcode.DUP: {
        const value = this.pop();
        this.push(value);
        this.push(value);
        break;
      }
      case Opcode.POP:
        this.pop();
        break;
      case Opcode.SWAP: {
        const b = this.pop();
        const a = this.pop();
        this.push(b);
        this.push(a);
        break;
      }
    }
  }

  private executeStateOp(opcode: Opcode): void {
    if (opcode === Opcode.SAVE_STATE) {
      const snapshot = this.snapshot();
      this.state.stateStack.push(snapshot);
    } else if (opcode === Opcode.RESTORE_STATE) {
      if (this.state.stateStack.length === 0) {
        throw new Error("RESTORE_STATE with empty state stack");
      }
      const savedState = this.state.stateStack.pop();
      if (!savedState) {
        throw new Error("RESTORE_STATE failed to pop state");
      }
      // Restore transform state (position, rotation, scale, color)
      this.state.position = { ...savedState.position };
      this.state.rotation = savedState.rotation;
      this.state.scale = savedState.scale;
      this.state.color = { ...savedState.color };
      // Actually apply the restored transform to the renderer
      this.renderer.setPosition(savedState.position.x, savedState.position.y);
      this.renderer.setRotation(savedState.rotation);
      this.renderer.setScale(savedState.scale);
      this.renderer.setColor(
        savedState.color.h,
        savedState.color.s,
        savedState.color.l,
      );
    }
  }

  private executeLoopOp(): void {
    // Stack: [..., instructionCount, loopCount]
    // Replays the last N instructions M times
    const loopCount = this.pop();
    const instructionCount = this.pop();

    // Validate loop parameters
    if (loopCount < 0 || instructionCount < 0) {
      throw new Error(
        `LOOP requires non-negative parameters (count: ${loopCount}, instructions: ${instructionCount})`,
      );
    }

    if (instructionCount > this.instructionHistory.length) {
      throw new Error(
        `LOOP instruction count (${instructionCount}) exceeds history length (${this.instructionHistory.length})`,
      );
    }

    // Get the instructions to replay
    // Note: The last LOOP_PARAMETER_COUNT instructions in history are the PUSH operations for loop parameters
    // We want to replay instructions BEFORE those parameter PUSHes
    const historyBeforeParams =
      this.instructionHistory.length - LOOP_PARAMETER_COUNT;
    const startIdx = historyBeforeParams - instructionCount;
    const instructionsToRepeat = this.instructionHistory.slice(
      startIdx,
      historyBeforeParams,
    );

    // Execute the loop body loopCount times
    for (let iteration = 0; iteration < loopCount; iteration++) {
      for (const {
        opcode: loopOpcode,
        codon: loopCodon,
        pushValue,
      } of instructionsToRepeat) {
        // Check instruction limit
        this.state.instructionCount++;
        if (this.state.instructionCount > this.maxInstructions) {
          throw new Error(
            `Instruction limit exceeded (${this.maxInstructions})`,
          );
        }

        // Handle PUSH specially - use stored value instead of executing
        if (loopOpcode === Opcode.PUSH && pushValue !== undefined) {
          this.push(pushValue);
        } else {
          // Execute other instructions normally (don't add to history - avoid infinite growth)
          this.execute(loopOpcode, loopCodon);
        }
      }
    }
  }

  private executeCompareOp(opcode: Opcode): void {
    const b = this.pop();
    const a = this.pop();
    if (opcode === Opcode.EQ) {
      this.push(a === b ? BOOLEAN_TRUE : BOOLEAN_FALSE);
    } else if (opcode === Opcode.LT) {
      this.push(a < b ? BOOLEAN_TRUE : BOOLEAN_FALSE);
    }
  }

  run(tokens: CodonToken[]): VMState[] {
    const snapshots: VMState[] = [];
    this.reset();

    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      const opcode = CODON_MAP[token.text];

      if (opcode === undefined) {
        throw new Error(
          `Unknown codon '${token.text}' at position ${token.position}`,
        );
      }

      this.state.instructionPointer = i;

      // Handle PUSH specially - reads next codon as numeric literal
      if (opcode === Opcode.PUSH) {
        i++;
        if (i >= tokens.length) {
          throw new Error(
            "PUSH instruction at end of program (missing numeric literal)",
          );
        }
        const literalCodon = tokens[i].text;
        const value = this.decodeNumericLiteral(literalCodon);
        this.push(value);
        this.instructionHistory.push({
          opcode: Opcode.PUSH,
          codon: token.text,
          pushValue: value,
        });
        snapshots.push(this.snapshot());
      } else if (opcode === Opcode.STOP) {
        // Stop execution
        snapshots.push(this.snapshot());
        break;
      } else {
        // Add non-LOOP instructions to history (LOOP doesn't get added to prevent recursion issues)
        if (opcode !== Opcode.LOOP) {
          this.instructionHistory.push({ opcode, codon: token.text });
        }
        this.execute(opcode, token.text);
        snapshots.push(this.snapshot());
      }

      i++;
    }

    return snapshots;
  }
}
