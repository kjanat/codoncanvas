#!/usr/bin/env bun

/**
 * Utility to extract and print colors from a genome file.
 * Useful for verifying color comments in genome files.
 *
 * Usage: bun scripts/get-colours.ts <path-to-genome>
 */

import { resolve } from "node:path";
import { CodonLexer } from "@/core/lexer";
import type { Renderer, TransformState } from "@/core/renderer";
import { CodonVM } from "@/core/vm";

import type { CodonToken } from "@/types";

// Constants from VM for reverse calculation
const STACK_VALUE_RANGE = 64;
const HUE_DEGREES = 360;
const PERCENT_SCALE = 100;

class MockRenderer implements Renderer {
  width = 400;
  height = 400;
  vm!: CodonVM;
  private _transform: TransformState = {
    x: 200,
    y: 200,
    rotation: 0,
    scale: 1,
  };

  constructor(
    private tokens: CodonToken[],
    private absoluteFilePath: string,
  ) {}

  resize(width?: number, height?: number): void {
    if (width) this.width = width;
    if (height) this.height = height;
  }

  clear(): void {}
  circle(_radius: number): void {}
  rect(_width: number, _height: number): void {}
  line(_length: number): void {}
  triangle(_size: number): void {}
  ellipse(_rx: number, _ry: number): void {}
  noise(_seed: number, _intensity: number): void {}
  translate(_dx: number, _dy: number): void {}
  setPosition(_x: number, _y: number): void {}
  rotate(_degrees: number): void {}
  setRotation(_degrees: number): void {}
  scale(_factor: number): void {}
  setScale(_scale: number): void {}

  setColor(h: number, s: number, l: number): void {
    // Reverse calculate stack values
    const rawH = Math.round((h / HUE_DEGREES) * STACK_VALUE_RANGE);
    const rawS = Math.round((s / PERCENT_SCALE) * STACK_VALUE_RANGE);
    const rawL = Math.round((l / PERCENT_SCALE) * STACK_VALUE_RANGE);

    const hslString = `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
    const hex = Bun.color(hslString, "hex");
    const ansi = Bun.color(hslString, "ansi");

    // Format for alignment
    const fmtRawH = rawH.toString().padStart(2);
    const fmtRawS = rawS.toString().padStart(2);
    const fmtRawL = rawL.toString().padStart(2);

    const fmtH = h.toFixed(1).padStart(5);
    const fmtS = s.toFixed(1).padStart(5);
    const fmtL = l.toFixed(1).padStart(5);

    // Get context
    const currentIdx = this.vm.state.instructionPointer;
    const currentToken = this.tokens[currentIdx];
    const lineNum = currentToken?.line ?? 0;

    // Get all tokens on this line
    const lineTokens = this.tokens
      .filter((t) => t.line === lineNum)
      .map((t) => t.text)
      .join(" ");

    // Create hyperlink: OSC 8 ;; URL ST Text OSC 8 ;; ST
    // VS Code supports file:///path/to/file#line
    const lineText = `Line ${lineNum.toString().padStart(2)}`;
    const url = `file://${this.absoluteFilePath}#${lineNum}`;
    const hyperlink = `\x1b]8;;${url}\x1b\\${lineText}\x1b]8;;\x1b\\`;

    console.log(
      `${ansi}■\x1b[0m ${hyperlink}: Color(H:${fmtRawH}, S:${fmtRawS}, L:${fmtRawL}) -> hsl(${fmtH},${fmtS}%,${fmtL}%) -> ${hex}  [${lineTokens}]`,
    );
  }

  getCurrentTransform(): TransformState {
    return this._transform;
  }

  toDataURL(): string {
    return "";
  }
}

async function main() {
  const filePath = Bun.argv[2];
  if (!filePath) {
    console.error("Usage: bun scripts/get-colours.ts <path-to-genome>");
    process.exit(1);
  }

  try {
    const absolutePath = resolve(process.cwd(), filePath);
    const file = Bun.file(absolutePath);
    const source = await file.text();

    console.log(`Analyzing colors in ${filePath}...\n`);

    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(source);

    const renderer = new MockRenderer(tokens, absolutePath);
    const vm = new CodonVM(renderer);
    renderer.vm = vm;

    vm.run(tokens);
  } catch (error) {
    console.error("Error executing genome:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
