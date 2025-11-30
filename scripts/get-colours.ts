#!/usr/bin/env bun

/**
 * Utility to extract and print colors from a genome file.
 * Useful for verifying color comments in genome files.
 *
 * Usage: bun scripts/get-colours.ts <path-to-genome>
 */

import { CodonLexer } from "@/core/lexer";
import type { Renderer, TransformState } from "@/core/renderer";
import { CodonVM } from "@/core/vm";

// Constants from VM for reverse calculation
const STACK_VALUE_RANGE = 64;
const HUE_DEGREES = 360;
const PERCENT_SCALE = 100;

class MockRenderer implements Renderer {
  width = 400;
  height = 400;
  private _transform: TransformState = {
    x: 200,
    y: 200,
    rotation: 0,
    scale: 1,
  };

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

    console.log(
      `${ansi}■\x1b[0m Color(H:${fmtRawH}, S:${fmtRawS}, L:${fmtRawL}) -> hsl(${fmtH},${fmtS}%,${fmtL}%) -> ${hex}`,
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
    const file = Bun.file(filePath);
    const source = await file.text();

    console.log(`Analyzing colors in ${filePath}...\n`);

    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(source);

    const renderer = new MockRenderer();
    const vm = new CodonVM(renderer);

    vm.run(tokens);
  } catch (error) {
    console.error("Error executing genome:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
