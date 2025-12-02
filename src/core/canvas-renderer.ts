/**
 * @fileoverview Canvas 2D rendering implementation for CodonCanvas
 *
 * Provides the {@link Canvas2DRenderer} implementation for drawing
 * CodonCanvas programs to HTML5 Canvas.
 *
 * @module core/canvas-renderer
 */

import type { Renderer, TransformState } from "./renderer";
import { generateNoisePoints, safeNum } from "./renderer";

/** Minimum scale to prevent zero/negative values breaking rendering */
const MIN_SCALE = 0.001;

/** Error thrown when canvas 2D context cannot be obtained */
export class CanvasContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanvasContextError";
  }
}

/**
 * Canvas 2D rendering implementation.
 * Renders CodonCanvas programs to HTML5 Canvas with full transform support.
 *
 * **Coordinate System:**
 * - Origin (0,0) is top-left of canvas
 * - Positive X goes right, positive Y goes down
 * - Initial position is canvas center (width/2, height/2)
 *
 * **Rendering Behavior:**
 * - All shapes are both filled AND stroked with current color
 * - Shape anchor point is always CENTER (not top-left corner)
 * - Drawing operations DO NOT modify position (use translate)
 *
 * @example
 * ```typescript
 * const canvas = document.querySelector('canvas');
 * const renderer = new Canvas2DRenderer(canvas);
 * renderer.clear();
 * renderer.setColor(200, 80, 50);
 * renderer.circle(50); // Draw blue circle
 * ```
 */
export class Canvas2DRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private currentX: number = 0;
  private currentY: number = 0;
  private currentRotation: number = 0;
  private currentScale: number = 1;

  private _width: number;
  private _height: number;

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new CanvasContextError("Could not get 2D context from canvas");
    }
    this.ctx = context;
    this._width = canvas.width;
    this._height = canvas.height;

    // Initialize at center
    this.currentX = this._width / 2;
    this.currentY = this._height / 2;
  }

  /**
   * Update renderer dimensions to match canvas size.
   * Call this after the canvas element has been resized.
   * Recenters position and resets rotation/scale.
   * @param _width - Ignored (reads from canvas element)
   * @param _height - Ignored (reads from canvas element)
   */
  resize(_width?: number, _height?: number): void {
    this._width = this.ctx.canvas.width;
    this._height = this.ctx.canvas.height;
    this.currentX = this._width / 2;
    this.currentY = this._height / 2;
    this.currentRotation = 0;
    this.currentScale = 1;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this._width, this._height);
    this.currentX = this._width / 2;
    this.currentY = this._height / 2;
    this.currentRotation = 0;
    this.currentScale = 1;
  }

  private applyTransform(): void {
    this.ctx.save();
    this.ctx.translate(this.currentX, this.currentY);
    this.ctx.rotate((this.currentRotation * Math.PI) / 180);
    this.ctx.scale(this.currentScale, this.currentScale);
  }

  private restoreTransform(): void {
    this.ctx.restore();
  }

  circle(radius: number): void {
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.restoreTransform();
  }

  rect(width: number, height: number): void {
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.rect(-width / 2, -height / 2, width, height);
    this.ctx.fill();
    this.ctx.stroke();
    this.restoreTransform();
  }

  line(length: number): void {
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.moveTo(-length / 2, 0);
    this.ctx.lineTo(length / 2, 0);
    this.ctx.stroke();
    this.restoreTransform();
  }

  triangle(size: number): void {
    this.applyTransform();
    const height = (size * Math.sqrt(3)) / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -height / 2);
    this.ctx.lineTo(-size / 2, height / 2);
    this.ctx.lineTo(size / 2, height / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.restoreTransform();
  }

  ellipse(rx: number, ry: number): void {
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.restoreTransform();
  }

  noise(seed: number, intensity: number): void {
    const points = generateNoisePoints(seed, intensity, this.width);

    this.applyTransform();
    for (const { x, y } of points) {
      this.ctx.fillRect(x, y, 1, 1);
    }
    this.restoreTransform();
  }

  setPosition(x: number, y: number): void {
    this.currentX = safeNum(x);
    this.currentY = safeNum(y);
  }

  translate(dx: number, dy: number): void {
    this.currentX += safeNum(dx);
    this.currentY += safeNum(dy);
  }

  setRotation(degrees: number): void {
    this.currentRotation = safeNum(degrees);
  }

  rotate(degrees: number): void {
    this.currentRotation += safeNum(degrees);
  }

  setScale(scale: number): void {
    this.currentScale = Math.max(safeNum(scale), MIN_SCALE);
  }

  scale(factor: number): void {
    this.currentScale = Math.max(
      this.currentScale * safeNum(factor),
      MIN_SCALE,
    );
  }

  setColor(h: number, s: number, l: number): void {
    const color = `hsl(${h}, ${s}%, ${l}%)`;
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
  }

  getCurrentTransform(): TransformState {
    return {
      x: this.currentX,
      y: this.currentY,
      rotation: this.currentRotation,
      scale: this.currentScale,
    };
  }

  toDataURL(): string {
    return this.ctx.canvas.toDataURL();
  }
}
