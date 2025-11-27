/**
 * 2D coordinate point for canvas positions.
 * Used throughout VM state and rendering operations.
 */
export interface Point2D {
  /** X coordinate (horizontal position) */
  x: number;
  /** Y coordinate (vertical position) */
  y: number;
}

/**
 * HSL color representation.
 * - h: Hue (0-360 degrees)
 * - s: Saturation (0-100 percent)
 * - l: Lightness (0-100 percent)
 */
export interface HSLColor {
  /** Hue (0-360 degrees) */
  h: number;
  /** Saturation (0-100 percent) */
  s: number;
  /** Lightness (0-100 percent) */
  l: number;
}
