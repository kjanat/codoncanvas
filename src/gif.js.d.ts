/**
 * Type definitions for gif.js library
 * @see https://github.com/jnordberg/gif.js
 */

declare module "gif.js" {
  interface GIFOptions {
    /** Number of web workers to spawn (default: 2) */
    workers?: number;
    /** Quality of output (1-30, lower is better, default: 10) */
    quality?: number;
    /** Width of output GIF in pixels */
    width?: number;
    /** Height of output GIF in pixels */
    height?: number;
    /** Repeat count: -1 for infinite, 0 for no repeat, N for N times */
    repeat?: number;
    /** Background color (default: null for transparent) */
    background?: string;
    /** URL to worker script (default: "gif.worker.js") */
    workerScript?: string;
    /** Enable debug logging */
    debug?: boolean;
    /** Dithering algorithm: null, "FloydSteinberg", "FalseFloydSteinberg", "Stucki", "Atkinson" */
    dither?: string | boolean | null;
  }

  interface FrameOptions {
    /** Frame delay in ms (default: 500) */
    delay?: number;
    /** Copy pixel data */
    copy?: boolean;
    /** Frame disposal method */
    dispose?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);

    /**
     * Add a frame to the GIF
     * @param element Canvas, CanvasRenderingContext2D, ImageData, or image element
     * @param options Frame-specific options
     */
    addFrame(
      element:
        | HTMLCanvasElement
        | CanvasRenderingContext2D
        | ImageData
        | HTMLImageElement,
      options?: FrameOptions,
    ): void;

    /** Start rendering the GIF */
    render(): void;

    /** Abort rendering */
    abort(): void;

    /** Event handler for when GIF is finished rendering */
    on(event: "finished", callback: (blob: Blob) => void): void;
    /** Event handler for rendering progress */
    on(event: "progress", callback: (progress: number) => void): void;
    /** Event handler for abort */
    on(event: "abort", callback: () => void): void;
    /** Event handler for errors */
    on(event: "error", callback: (error: Error) => void): void;
  }

  export default GIF;
}
