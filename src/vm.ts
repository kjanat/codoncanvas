import { Renderer } from './renderer';
import { CODON_MAP, CodonToken, Opcode, VMState, Codon } from './types';

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
  private maxInstructions: number = 10000;
  private instructionHistory: { opcode: Opcode; codon: Codon; pushValue?: number }[] = [];

  constructor(renderer: Renderer) {
    this.renderer = renderer;
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
      seed: Date.now()
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
      throw new Error(`Stack underflow at instruction ${this.state.instructionPointer}`);
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
    const baseMap: Record<string, number> = { 'A': 0, 'C': 1, 'G': 2, 'T': 3 };
    const d1 = baseMap[codon[0]] || 0;
    const d2 = baseMap[codon[1]] || 0;
    const d3 = baseMap[codon[2]] || 0;
    return d1 * 16 + d2 * 4 + d3;
  }

  /**
   * Scale value from 0-63 range to canvas coordinates
   */
  private scaleValue(value: number): number {
    return (value / 64) * this.renderer.width;
  }

  execute(opcode: Opcode, codon: string): void {
    this.state.instructionCount++;

    if (this.state.instructionCount > this.maxInstructions) {
      throw new Error('Instruction limit exceeded (max 10,000)');
    }

    // Track executed opcode for MIDI export
    this.state.lastOpcode = opcode;

    switch (opcode) {
      case Opcode.START:
        // Initialize execution
        break;

      case Opcode.STOP:
        // Terminate execution (handled by run loop)
        break;

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
        const factor = this.pop() / 32; // Scale to reasonable range
        this.renderer.scale(factor);
        this.state.scale = this.renderer.getCurrentTransform().scale;
        break;
      }

      case Opcode.COLOR: {
        const l = this.pop() * (100 / 64); // Map 0-63 to 0-100%
        const s = this.pop() * (100 / 64); // Map 0-63 to 0-100%
        const h = this.pop() * (360 / 64); // Map 0-63 to 0-360
        this.renderer.setColor(h, s, l);
        this.state.color = { h, s, l };
        break;
      }

      case Opcode.PUSH:
        // Push is handled in run() as it needs the next codon
        break;

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

      case Opcode.NOP:
        // No operation
        break;

      case Opcode.SAVE_STATE: {
        const snapshot = this.snapshot();
        this.state.stateStack.push(snapshot);
        break;
      }

      case Opcode.RESTORE_STATE: {
        if (this.state.stateStack.length === 0) {
          throw new Error('RESTORE_STATE with empty state stack');
        }
        const savedState = this.state.stateStack.pop()!;
        // Restore transform state (position, rotation, scale, color)
        this.state.position = { ...savedState.position };
        this.state.rotation = savedState.rotation;
        this.state.scale = savedState.scale;
        this.state.color = { ...savedState.color };
        // Actually apply the restored transform to the renderer
        this.renderer.setPosition(savedState.position.x, savedState.position.y);
        this.renderer.setRotation(savedState.rotation);
        this.renderer.setScale(savedState.scale);
        this.renderer.setColor(savedState.color.h, savedState.color.s, savedState.color.l);
        break;
      }

      case Opcode.ADD: {
        const b = this.pop();
        const a = this.pop();
        this.push(a + b);
        break;
      }

      case Opcode.MUL: {
        const b = this.pop();
        const a = this.pop();
        this.push(a * b);
        break;
      }

      case Opcode.SUB: {
        const b = this.pop();
        const a = this.pop();
        this.push(a - b);
        break;
      }

      case Opcode.DIV: {
        const b = this.pop();
        const a = this.pop();
        if (b === 0) {
          throw new Error(`Division by zero at instruction ${this.state.instructionPointer}`);
        }
        this.push(Math.floor(a / b));
        break;
      }

      case Opcode.LOOP: {
        // Stack: [..., instructionCount, loopCount]
        // Replays the last N instructions M times
        const loopCount = this.pop();
        const instructionCount = this.pop();

        // Validate loop parameters
        if (loopCount < 0 || instructionCount < 0) {
          throw new Error(`LOOP requires non-negative parameters (count: ${loopCount}, instructions: ${instructionCount})`);
        }

        if (instructionCount > this.instructionHistory.length) {
          throw new Error(`LOOP instruction count (${instructionCount}) exceeds history length (${this.instructionHistory.length})`);
        }

        // Get the instructions to replay
        // Note: The last 2 instructions in history are the PUSH operations for loop parameters
        // We want to replay instructions BEFORE those parameter PUSHes
        const historyBeforeParams = this.instructionHistory.length - 2;
        const startIdx = historyBeforeParams - instructionCount;
        const instructionsToRepeat = this.instructionHistory.slice(startIdx, historyBeforeParams);

        // Execute the loop body loopCount times
        for (let iteration = 0; iteration < loopCount; iteration++) {
          for (const { opcode: loopOpcode, codon: loopCodon, pushValue } of instructionsToRepeat) {
            // Check instruction limit
            this.state.instructionCount++;
            if (this.state.instructionCount > this.maxInstructions) {
              throw new Error(`Instruction limit exceeded (${this.maxInstructions})`);
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
        break;
      }

      case Opcode.EQ: {
        // Equality comparison: [a, b] → [1 if a==b else 0]
        const b = this.pop();
        const a = this.pop();
        this.push(a === b ? 1 : 0);
        break;
      }

      case Opcode.LT: {
        // Less than comparison: [a, b] → [1 if a<b else 0]
        const b = this.pop();
        const a = this.pop();
        this.push(a < b ? 1 : 0);
        break;
      }

      default:
        throw new Error(`Unknown opcode: ${opcode}`);
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
        throw new Error(`Unknown codon '${token.text}' at position ${token.position}`);
      }

      this.state.instructionPointer = i;

      // Handle PUSH specially - reads next codon as numeric literal
      if (opcode === Opcode.PUSH) {
        i++;
        if (i >= tokens.length) {
          throw new Error('PUSH instruction at end of program (missing numeric literal)');
        }
        const literalCodon = tokens[i].text;
        const value = this.decodeNumericLiteral(literalCodon);
        this.push(value);
        this.instructionHistory.push({ opcode: Opcode.PUSH, codon: token.text, pushValue: value });
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
