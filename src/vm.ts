import { Renderer } from './renderer';
import { CODON_MAP, CodonToken, Opcode, VMState } from './types';

export interface VM {
  state: VMState;
  renderer: Renderer;
  execute(opcode: Opcode, codon: string): void;
  run(tokens: CodonToken[]): VMState[];
  reset(): void;
  snapshot(): VMState;
  restore(state: VMState): void;
}

export class CodonVM implements VM {
  state: VMState;
  renderer: Renderer;
  private maxInstructions: number = 10000;

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
        const l = this.pop();
        const s = this.pop();
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

      case Opcode.NOISE: {
        const intensity = this.pop();
        const seed = this.pop();
        this.renderer.noise(seed, intensity);
        break;
      }

      case Opcode.SAVE_STATE: {
        const snapshot = this.snapshot();
        this.state.stateStack.push(snapshot);
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
        snapshots.push(this.snapshot());
      } else if (opcode === Opcode.STOP) {
        // Stop execution
        snapshots.push(this.snapshot());
        break;
      } else {
        this.execute(opcode, token.text);
        snapshots.push(this.snapshot());
      }

      i++;
    }

    return snapshots;
  }
}
