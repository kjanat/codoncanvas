/**
 * @fileoverview Abstract base renderer for CodonCanvas
 *
 * Provides shared transform state management and color handling
 * for all renderer implementations (Canvas2D, SVG, etc.).
 *
 * @module core/base-renderer
 */

import type { TransformState } from "./renderer";
import { safeNum } from "./renderer";

/** Minimum scale to prevent zero/negative values breaking rendering */
export const MIN_SCALE = 0.001;

/**
 * Abstract base class for renderers.
 * Provides shared transform state management and normalized color handling.
 *
 * Subclasses must implement:
 * - Drawing primitives (circle, rect, line, triangle, ellipse, noise)
 * - clear(), resize()
 * - toDataURL()
 * - width/height getters
 */
export abstract class BaseRenderer {
  protected currentX: number = 0;
  protected currentY: number = 0;
  protected currentRotation: number = 0;
  protected currentScale: number = 1;
  protected currentColor: string = "hsl(0, 0%, 0%)";

  /**
   * Set absolute drawing position.
   * @param x - X coordinate in pixels (0 = left edge)
   * @param y - Y coordinate in pixels (0 = top edge)
   */
  setPosition(x: number, y: number): void {
    this.currentX = safeNum(x);
    this.currentY = safeNum(y);
  }

  /**
   * Move drawing position by relative offset.
   * @param dx - Horizontal offset in pixels (positive = right)
   * @param dy - Vertical offset in pixels (positive = down)
   */
  translate(dx: number, dy: number): void {
    this.currentX += safeNum(dx);
    this.currentY += safeNum(dy);
  }

  /**
   * Set absolute rotation angle.
   * @param degrees - Rotation in degrees (0 = right, 90 = down)
   */
  setRotation(degrees: number): void {
    this.currentRotation = safeNum(degrees);
  }

  /**
   * Rotate drawing direction by relative degrees.
   * @param degrees - Rotation to add (positive = clockwise)
   */
  rotate(degrees: number): void {
    this.currentRotation += safeNum(degrees);
  }

  /**
   * Set absolute scale factor.
   * @param scale - Scale multiplier (1.0 = normal, 2.0 = double size)
   */
  setScale(scale: number): void {
    this.currentScale = Math.max(safeNum(scale), MIN_SCALE);
  }

  /**
   * Scale subsequent drawing operations by relative factor.
   * @param factor - Scale multiplier (compounds with current scale)
   */
  scale(factor: number): void {
    this.currentScale = Math.max(
      this.currentScale * safeNum(factor),
      MIN_SCALE,
    );
  }

  /**
   * Set drawing color for fill and stroke.
   * Normalizes HSL values to valid ranges.
   * @param h - Hue in degrees (0-360, normalized to 0-359)
   * @param s - Saturation percentage (clamped to 0-100)
   * @param l - Lightness percentage (clamped to 0-100)
   */
  setColor(h: number, s: number, l: number): void {
    const sanitizedH = safeNum(h);
    const sanitizedS = safeNum(s);
    const sanitizedL = safeNum(l);
    const safeH = ((sanitizedH % 360) + 360) % 360; // Normalize hue to 0-359
    const safeS = Math.max(0, Math.min(100, sanitizedS));
    const safeL = Math.max(0, Math.min(100, sanitizedL));
    this.currentColor = `hsl(${safeH}, ${safeS}%, ${safeL}%)`;
  }

  /**
   * Get current transform state for VM state tracking.
   */
  getCurrentTransform(): TransformState {
    return {
      x: this.currentX,
      y: this.currentY,
      rotation: this.currentRotation,
      scale: this.currentScale,
    };
  }

  /**
   * Reset transform state to center of given dimensions.
   * Called by subclass clear() and resize() implementations.
   */
  protected resetTransformState(width: number, height: number): void {
    this.currentX = width / 2;
    this.currentY = height / 2;
    this.currentRotation = 0;
    this.currentScale = 1;
  }
}
