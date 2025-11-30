/**
 * @fileoverview Renderer factory for CodonCanvas
 *
 * Provides factory function to create renderers based on type.
 *
 * @module core/renderer-factory
 */

import { Canvas2DRenderer } from "./canvas-renderer";
import type { Renderer } from "./renderer";
import { SVGRenderer } from "./svg-renderer";

/** Available renderer types */
export type RendererType = "canvas" | "svg";

/** Options for creating a renderer */
export interface RendererOptions {
  /** Renderer type */
  type: RendererType;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Canvas element (required for canvas type) */
  canvas?: HTMLCanvasElement;
}

/**
 * Create a renderer of the specified type.
 *
 * @param options - Renderer creation options
 * @returns Renderer instance
 * @throws Error if canvas type is requested without canvas element
 *
 * @example
 * ```typescript
 * // Create canvas renderer
 * const canvasRenderer = createRenderer({
 *   type: "canvas",
 *   width: 400,
 *   height: 400,
 *   canvas: canvasElement
 * });
 *
 * // Create SVG renderer
 * const svgRenderer = createRenderer({
 *   type: "svg",
 *   width: 400,
 *   height: 400
 * });
 * ```
 */
export function createRenderer(options: RendererOptions): Renderer {
  const { type, width, height, canvas } = options;

  switch (type) {
    case "canvas":
      if (!canvas) {
        throw new Error("Canvas renderer requires canvas element");
      }
      return new Canvas2DRenderer(canvas);

    case "svg":
      return new SVGRenderer(width, height);

    default:
      throw new Error(`Unknown renderer type: ${type}`);
  }
}
