#!/usr/bin/env bun

/**
 * Screenshot generation utility for CodonCanvas showcase genomes.
 * Renders genome files to PNG images using node-canvas for visual documentation.
 *
 * Usage: npm run generate-screenshots
 * Output: examples/screenshots/*.png (full size 400x400)
 */

import { mkdir, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";
import { type Canvas, createCanvas } from "canvas";
import type { Renderer } from "@/core";
import { CodonLexer } from "@/core/lexer";
import { generateNoisePoints } from "@/core/renderer";
import { CodonVM } from "@/core/vm";

/** Directory of the script */
const __dirname = import.meta.dir;
/** Directory of the examples */
const __examplesDir = join(__dirname, "../examples");
/** Directory of the screenshots */
const __screenshotsDir = join(__examplesDir, "screenshots");

/**
 * Node-canvas renderer adapter for server-side rendering.
 * Implements Renderer interface using node-canvas API.
 */
export class NodeCanvasRenderer implements Renderer {
  private canvas: Canvas;
  private ctx: ReturnType<Canvas["getContext"]>;
  private _x = 200;
  private _y = 200;
  private _rotation = 0;
  private _scale = 1;

  constructor(width: number = 400, height: number = 400) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, width, height);
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  resize(): void {
    // Re-read dimensions from canvas and reset state
    this._x = this.width / 2;
    this._y = this.height / 2;
    this._rotation = 0;
    this._scale = 1;
  }

  clear(): void {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this._x = this.width / 2;
    this._y = this.height / 2;
    this._rotation = 0;
    this._scale = 1;
  }

  circle(radius: number): void {
    const scaledRadius = radius * this._scale; // radius already scaled by VM
    this.ctx.save();
    this.ctx.translate(this._x, this._y);
    this.ctx.rotate((this._rotation * Math.PI) / 180);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, scaledRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  rect(width: number, height: number): void {
    const scaledW = width * this._scale; // already scaled by VM
    const scaledH = height * this._scale; // already scaled by VM
    this.ctx.save();
    this.ctx.translate(this._x, this._y);
    this.ctx.rotate((this._rotation * Math.PI) / 180);
    this.ctx.fillRect(-scaledW / 2, -scaledH / 2, scaledW, scaledH);
    this.ctx.strokeRect(-scaledW / 2, -scaledH / 2, scaledW, scaledH);
    this.ctx.restore();
  }

  line(length: number): void {
    const scaledLength = length * this._scale;
    this.ctx.save();
    this.ctx.translate(this._x, this._y);
    this.ctx.rotate((this._rotation * Math.PI) / 180);
    this.ctx.beginPath();
    this.ctx.moveTo(-scaledLength / 2, 0);
    this.ctx.lineTo(scaledLength / 2, 0);
    this.ctx.stroke();
    this.ctx.restore();
  }

  triangle(size: number): void {
    const scaledSize = size * this._scale; // already scaled by VM
    const height = (scaledSize * Math.sqrt(3)) / 2;
    this.ctx.save();
    this.ctx.translate(this._x, this._y);
    this.ctx.rotate((this._rotation * Math.PI) / 180);
    this.ctx.beginPath();
    this.ctx.moveTo(0, -height / 2);
    this.ctx.lineTo(-scaledSize / 2, height / 2);
    this.ctx.lineTo(scaledSize / 2, height / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  ellipse(rx: number, ry: number): void {
    const scaledRx = rx * this._scale; // already scaled by VM
    const scaledRy = ry * this._scale; // already scaled by VM
    this.ctx.save();
    this.ctx.translate(this._x, this._y);
    this.ctx.rotate((this._rotation * Math.PI) / 180);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, scaledRx, scaledRy, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  noise(seed: number, intensity: number): void {
    const points = generateNoisePoints(seed, intensity, this.width);
    this.ctx.save();
    this.ctx.translate(this._x, this._y);
    for (const { x, y } of points) {
      this.ctx.fillRect(x, y, 1, 1);
    }
    this.ctx.restore();
  }

  translate(dx: number, dy: number): void {
    // dx and dy already scaled by VM
    this._x += dx;
    this._y += dy;
  }

  setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
  }

  rotate(degrees: number): void {
    this._rotation += degrees;
  }

  setRotation(degrees: number): void {
    this._rotation = degrees;
  }

  scale(factor: number): void {
    this._scale *= factor;
  }

  setScale(scale: number): void {
    this._scale = scale;
  }

  setColor(h: number, s: number, l: number): void {
    this.ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    this.ctx.strokeStyle = `hsl(${h}, ${s}%, ${Math.max(0, l - 20)}%)`;
    this.ctx.lineWidth = 2;
  }

  getCurrentTransform() {
    return {
      x: this._x,
      y: this._y,
      rotation: this._rotation,
      scale: this._scale,
    };
  }

  toDataURL(): string {
    return this.canvas.toDataURL();
  }

  /**
   * Export canvas as PNG buffer.
   */
  toPNG(): Buffer {
    return this.canvas.toBuffer("image/png");
  }
}

/**
 * Showcase genomes to render.
 */
const SHOWCASE_GENOMES = [
  "fractalFlower",
  "geometricMosaic",
  "starfield",
  "recursiveCircles",
  "kaleidoscope",
  "wavyLines",
  "cosmicWheel",
];

/**
 * Render a genome file to PNG.
 */
export async function renderGenome(
  genomePath: Bun.BunFile,
  outputPath: Bun.BunFile,
): Promise<void> {
  console.log(`Rendering ${genomePath.name}...`);

  // Read genome source
  const source = await genomePath.text();

  // Tokenize
  const lexer = new CodonLexer();
  const tokens = lexer.tokenize(source);

  // Create renderer and VM
  const renderer = new NodeCanvasRenderer(400, 400);
  const vm = new CodonVM(renderer);

  // Execute genome
  vm.run(tokens);

  // Export PNG
  const png = renderer.toPNG();
  await Bun.write(outputPath, png);

  console.log(`✓ Generated ${outputPath.name}`);
}

/**
 * Main execution.
 */
async function main(): Promise<void> {
  console.log("🎨 CodonCanvas Screenshot Generator\n");

  // Ensure output directory exists
  await mkdir(__screenshotsDir, { recursive: true });

  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      all: { type: "boolean", short: "a" },
      file: { type: "string", short: "f" },
    },
    strict: true,
    allowPositionals: true,
  });

  let genomesToRender: string[] = [];

  if (values.file) {
    // Render specific file
    // We need to handle full paths or relative paths
    const fullPath = Bun.file(Bun.resolveSync(values.file, process.cwd()));
    const name = basename(values.file, ".genome");
    const outputPath = Bun.file(join(__screenshotsDir, `${name}.png`));

    try {
      await renderGenome(fullPath, outputPath);
      console.log(`\n📊 Summary: 1 successful, 0 failed`);
      console.log(`📁 Screenshot saved to: examples/screenshots/${name}.png\n`);
      process.exit(0);
    } catch (error) {
      console.error(`✗ Failed to render ${values.file}:`, error);
      process.exit(1);
    }
  } else if (values.all) {
    // Render all .genome files in examples directory
    const files = await readdir(__examplesDir);
    genomesToRender = files
      .filter((file) => file.endsWith(".genome"))
      .map((file) => file.replace(".genome", ""));
  } else {
    // Default: Render showcase genomes
    genomesToRender = SHOWCASE_GENOMES;
  }

  // Render the selected genomes
  let successCount = 0;
  let errorCount = 0;

  for (const genomeName of genomesToRender) {
    try {
      const genomePath = Bun.file(
        Bun.resolveSync(`${genomeName}.genome`, __examplesDir),
      );
      const outputPath = Bun.file(join(__screenshotsDir, `${genomeName}.png`));
      await renderGenome(genomePath, outputPath);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to render ${genomeName}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} successful, ${errorCount} failed`);
  console.log(`📁 Screenshots saved to: examples/screenshots/\n`);

  process.exit(errorCount > 0 ? 1 : 0);
}

// Only run when executed directly
if (import.meta.main) {
  main();
}
