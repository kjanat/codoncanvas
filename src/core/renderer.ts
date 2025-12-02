/**
 * @fileoverview Renderer interface and shared utilities for CodonCanvas
 *
 * Provides the {@link Renderer} interface for graphics output backends
 * (Canvas2D, SVG, etc.) and shared utilities like SeededRandom.
 *
 * @module core/renderer
 */

import type { Point2D } from "@/types";

export type { Point2D };

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
 */
export class SeededRandom {
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

/** Clamp value to [min, max] range */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Sanitize numeric value (NaN/Infinity -> 0) */
export function safeNum(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

/** Max intensity value for noise operations */
export const MAX_NOISE_INTENSITY = 64;

/** Minimum dot count for noise (ensures visibility) */
const MIN_NOISE_DOTS = 10;

/** Dots per intensity unit */
const DOTS_PER_INTENSITY = 5;

/**
 * Compute noise parameters from intensity.
 * Clamps intensity to [0, 64] to prevent invalid geometry.
 */
export function computeNoiseParams(
  intensity: number,
  canvasWidth: number,
): { radius: number; dotCount: number } {
  const safeIntensity = clamp(safeNum(intensity), 0, MAX_NOISE_INTENSITY);
  return {
    radius: (safeIntensity / MAX_NOISE_INTENSITY) * canvasWidth,
    dotCount: Math.floor(safeIntensity * DOTS_PER_INTENSITY) + MIN_NOISE_DOTS,
  };
}

/**
 * Generate noise points using rejection sampling within a circle.
 * Returns deterministic points based on seed for reproducibility.
 *
 * @param seed - RNG seed for reproducibility
 * @param intensity - Noise intensity (0-64, clamped internally)
 * @param canvasWidth - Canvas width for radius scaling
 * @returns Array of (x, y) points within the noise circle
 */
export function generateNoisePoints(
  seed: number,
  intensity: number,
  canvasWidth: number,
): Point2D[] {
  const safeSeed = safeNum(seed);
  const { radius, dotCount } = computeNoiseParams(intensity, canvasWidth);
  const rng = new SeededRandom(safeSeed);
  const points: Point2D[] = [];

  for (let i = 0; i < dotCount; i++) {
    let px: number;
    let py: number;
    do {
      px = (rng.next() * 2 - 1) * radius;
      py = (rng.next() * 2 - 1) * radius;
    } while (px * px + py * py > radius * radius);

    points.push({ x: px, y: py });
  }

  return points;
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
  /** Canvas width in pixels */
  readonly width: number;
  /** Canvas height in pixels */
  readonly height: number;

  /**
   * Update renderer dimensions after resize.
   * Recenters position and resets rotation/scale.
   * @param width - New width (Canvas2DRenderer reads from canvas, SVGRenderer uses this param)
   * @param height - New height (Canvas2DRenderer reads from canvas, SVGRenderer uses this param)
   */
  resize(width?: number, height?: number): void;

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
   * @param intensity - Noise intensity (0-64, clamped internally)
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
   * Export as data URL.
   * @returns Base64-encoded data URL (PNG for canvas, SVG for vector)
   */
  toDataURL(): string;
}
