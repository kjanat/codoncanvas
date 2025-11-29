/**
 * @fileoverview Canvas rendering implementation for CodonCanvas
 *
 * Provides the {@link Renderer} interface and {@link Canvas2DRenderer} implementation
 * for drawing CodonCanvas programs to HTML5 Canvas.
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
 * @module core/renderer
 */

import type { Point2D } from "@/types";

/**
 * Transform state for VM tracking.
 * Extends Point2D with rotation and scale for complete transform info.
 */
export interface TransformState extends Point2D {
  /** Current rotation in degrees */
  rotation: number;
  /** Current scale multiplier */
  scale: number;
}

/**
 * Seeded pseudo-random number generator (Linear Congruential Generator).
 * Provides deterministic randomness for NOISE opcode.
 * Returns values in [0, 1) range with reproducible output for same seed.
 * @internal
 */
class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed % 2147483647;
    if (this.state <= 0) {
      this.state += 2147483646;
    }
  }

  next(): number {
    this.state = (this.state * 48271) % 2147483647;
    return (this.state - 1) / 2147483646;
  }
}

/**
 * Renderer interface for CodonCanvas drawing operations.
 *
 * Abstraction layer for graphics output (Canvas2D, SVG, WebGL, etc.).
 * All shapes are drawn at current position with current transform state
 * (rotation, scale, color).
 *
 * **Key Behaviors:**
 * - All shapes are both filled AND stroked with current color
 * - Shape anchor point is always CENTER (not top-left)
 * - Drawing operations DO NOT modify position
 * - Transforms (rotate, scale) affect subsequent draws
 *
 * @example
 * ```typescript
 * const renderer = new Canvas2DRenderer(canvas);
 * renderer.setColor(200, 80, 50);  // Blue (HSL)
 * renderer.circle(50);              // Circle at center
 * renderer.translate(100, 0);       // Move right
 * renderer.rotate(45);              // Rotate 45 degrees
 * renderer.rect(60, 40);            // Rotated rectangle
 * ```
 */
export interface Renderer {
  /** Canvas width in pixels (read-only) */
  readonly width: number;
  /** Canvas height in pixels (read-only) */
  readonly height: number;

  /** Clear canvas, reset position to center, reset all transforms */
  clear(): void;

  /**
   * Draw filled+stroked circle at current position.
   * @param radius - Circle radius in pixels (scaled by current scale factor)
   */
  circle(radius: number): void;

  /**
   * Draw filled+stroked rectangle at current position.
   * @param width - Rectangle width in pixels
   * @param height - Rectangle height in pixels
   * @remarks Anchor point is rectangle CENTER (not top-left)
   */
  rect(width: number, height: number): void;

  /**
   * Draw line from current position in current rotation direction.
   * @param length - Line length in pixels
   * @remarks Does NOT modify position; use translate() to move
   */
  line(length: number): void;

  /**
   * Draw filled+stroked equilateral triangle at current position.
   * @param size - Triangle side length in pixels
   */
  triangle(size: number): void;

  /**
   * Draw filled+stroked ellipse at current position.
   * @param rx - Horizontal radius in pixels
   * @param ry - Vertical radius in pixels
   */
  ellipse(rx: number, ry: number): void;

  /**
   * Add visual noise/texture at current position.
   * @param seed - Random seed for reproducible noise pattern
   * @param intensity - Noise intensity (0-63, affects radius and dot count)
   */
  noise(seed: number, intensity: number): void;

  /**
   * Move drawing position by relative offset.
   * @param dx - Horizontal offset in pixels (positive = right)
   * @param dy - Vertical offset in pixels (positive = down)
   */
  translate(dx: number, dy: number): void;

  /**
   * Set absolute drawing position.
   * @param x - X coordinate in pixels (0 = left edge)
   * @param y - Y coordinate in pixels (0 = top edge)
   */
  setPosition(x: number, y: number): void;

  /**
   * Rotate drawing direction by relative degrees.
   * @param degrees - Rotation to add (positive = clockwise)
   */
  rotate(degrees: number): void;

  /**
   * Set absolute rotation angle.
   * @param degrees - Rotation in degrees (0 = right, 90 = down)
   */
  setRotation(degrees: number): void;

  /**
   * Scale subsequent drawing operations by relative factor.
   * @param factor - Scale multiplier (compounds with current scale)
   */
  scale(factor: number): void;

  /**
   * Set absolute scale factor.
   * @param scale - Scale multiplier (1.0 = normal, 2.0 = double size)
   */
  setScale(scale: number): void;

  /**
   * Set drawing color for fill and stroke.
   * @param h - Hue in degrees (0-360, 0=red, 120=green, 240=blue)
   * @param s - Saturation percentage (0-100, 0=gray, 100=vivid)
   * @param l - Lightness percentage (0-100, 0=black, 50=normal, 100=white)
   */
  setColor(h: number, s: number, l: number): void;

  /** Get current transform state for VM state tracking */
  getCurrentTransform(): TransformState;

  /**
   * Export canvas as data URL for image download.
   * @returns Base64-encoded PNG data URL
   */
  toDataURL(): string;
}

/**
 * Canvas 2D rendering implementation.
 * Renders CodonCanvas programs to HTML5 Canvas with full transform support.
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

  readonly width: number;
  readonly height: number;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;

    // Initialize at center
    this.currentX = this.width / 2;
    this.currentY = this.height / 2;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.currentX = this.width / 2;
    this.currentY = this.height / 2;
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
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(length, 0);
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
    // Convert intensity to pixel radius (0-63 → 0-canvas_width)
    const radius = (intensity / 64) * this.width;

    // Number of dots scales with intensity (more intense = more dots)
    const dotCount = Math.floor(intensity * 5) + 10; // 10-325 dots

    // Create seeded random generator for reproducibility
    const rng = new SeededRandom(seed);

    this.applyTransform();

    // Draw random dots within circular region
    for (let i = 0; i < dotCount; i++) {
      // Random point in circle using rejection sampling
      let px: number;
      let py: number;
      do {
        px = (rng.next() * 2 - 1) * radius;
        py = (rng.next() * 2 - 1) * radius;
      } while (px * px + py * py > radius * radius);

      // Draw small dot
      this.ctx.fillRect(px, py, 1, 1);
    }

    this.restoreTransform();
  }

  setPosition(x: number, y: number): void {
    this.currentX = x;
    this.currentY = y;
  }

  translate(dx: number, dy: number): void {
    this.currentX += dx;
    this.currentY += dy;
  }

  setRotation(degrees: number): void {
    this.currentRotation = degrees;
  }

  rotate(degrees: number): void {
    this.currentRotation += degrees;
  }

  setScale(scale: number): void {
    this.currentScale = scale;
  }

  scale(factor: number): void {
    this.currentScale *= factor;
  }

  setColor(h: number, s: number, l: number): void {
    const color = `hsl(${h}, ${s}%, ${l}%)`;
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
  }

  getCurrentTransform(): {
    x: number;
    y: number;
    rotation: number;
    scale: number;
  } {
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
