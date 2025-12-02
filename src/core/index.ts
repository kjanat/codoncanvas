/**
 * Core execution engine
 * Provides the fundamental building blocks for CodonCanvas
 */

export { Canvas2DRenderer, CanvasContextError } from "./canvas-renderer";
export type { Lexer } from "./lexer";
export { CodonLexer } from "./lexer";
// Renderer interface and implementations
export type { Renderer, TransformState } from "./renderer";
export { generateNoisePoints, SeededRandom } from "./renderer";
// Renderer factory
export type { RendererOptions, RendererType } from "./renderer-factory";
export { createRenderer } from "./renderer-factory";
export { SVGRenderer } from "./svg-renderer";

export type { VM } from "./vm";
export { CodonVM } from "./vm";
