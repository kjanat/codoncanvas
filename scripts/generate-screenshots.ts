#!/usr/bin/env tsx

/**
 * Screenshot generation utility for CodonCanvas showcase genomes.
 * Renders genome files to PNG images using node-canvas for visual documentation.
 *
 * Usage: npm run generate-screenshots
 * Output: examples/screenshots/*.png (full size 400x400)
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type Canvas, createCanvas } from "canvas";
import { CodonLexer } from "../src/lexer";
import type { Renderer } from "../src/renderer";
import { CodonVM } from "../src/vm";

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Node-canvas renderer adapter for server-side rendering.
 * Implements Renderer interface using node-canvas API.
 */
class NodeCanvasRenderer implements Renderer {
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
    const scaledLength = length * this._scale; // already scaled by VM
    const rad = (this._rotation * Math.PI) / 180;
    const endX = this._x + Math.cos(rad) * scaledLength;
    const endY = this._y + Math.sin(rad) * scaledLength;
    this.ctx.beginPath();
    this.ctx.moveTo(this._x, this._y);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
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
    const size = 100;
    const imageData = this.ctx.createImageData(size, size);
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;

    for (let i = 0; i < size * size * 4; i += 4) {
      state = (state * 48271) % 2147483647;
      const rand = (state - 1) / 2147483646;
      const gray = Math.floor(rand * intensity);
      imageData.data[i] = gray;
      imageData.data[i + 1] = gray;
      imageData.data[i + 2] = gray;
      imageData.data[i + 3] = Math.floor((intensity / 100) * 255);
    }

    this.ctx.save();
    this.ctx.translate(this._x - size / 2, this._y - size / 2);
    this.ctx.putImageData(imageData, 0, 0);
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
function renderGenome(genomePath: string, outputPath: string): void {
  console.log(`Rendering ${genomePath}...`);

  // Read genome source
  const source = readFileSync(genomePath, "utf-8");

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
  writeFileSync(outputPath, png);

  console.log(`✓ Generated ${outputPath}`);
}

/**
 * Main execution.
 */
function main(): void {
  console.log("🎨 CodonCanvas Screenshot Generator\n");

  // Ensure output directory exists
  const screenshotsDir = join(__dirname, "../examples/screenshots");
  mkdirSync(screenshotsDir, { recursive: true });

  // Render each showcase genome
  let successCount = 0;
  let errorCount = 0;

  for (const genomeName of SHOWCASE_GENOMES) {
    try {
      const genomePath = join(__dirname, `../examples/${genomeName}.genome`);
      const outputPath = join(screenshotsDir, `${genomeName}.png`);
      renderGenome(genomePath, outputPath);
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

// Run main
main();
