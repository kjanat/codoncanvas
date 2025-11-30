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

/** Options for creating an SVG renderer */
export interface SVGRendererOptions {
  /** Renderer type discriminant */
  type: "svg";
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/** Options for creating a Canvas renderer */
export interface CanvasRendererOptions {
  /** Renderer type discriminant */
  type: "canvas";
  /** Canvas element (dimensions derived from element) */
  canvas: HTMLCanvasElement;
}

/** Options for creating a renderer (discriminated union) */
export type RendererOptions = SVGRendererOptions | CanvasRendererOptions;

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
  switch (options.type) {
    case "canvas":
      return new Canvas2DRenderer(options.canvas);

    case "svg":
      return new SVGRenderer(options.width, options.height);

    default: {
      const _exhaustive: never = options;
      throw new Error(
        `Unknown renderer type: ${(_exhaustive as RendererOptions).type}`,
      );
    }
  }
}
