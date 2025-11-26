/**
 * GIF animation exporter for CodonCanvas timeline animations
 * Uses gif.js library for encoding (types defined in gif.js.d.ts)
 */

import GIF from "gif.js";

export interface GifExportOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-30, lower is better (10 is good default)
  fps?: number; // frames per second
  repeat?: number; // -1 for infinite, 0 for no repeat, N for N times
  workerScript?: string;
}

export interface ExportProgress {
  percent: number;
  currentFrame: number;
  totalFrames: number;
}

/**
 * GIF Exporter - Converts execution timeline to animated GIF
 *
 * Records canvas drawing state at each step and encodes to animated GIF
 * for sharing and demonstration purposes. Uses gif.js worker-based encoding
 * to avoid blocking the main thread.
 *
 * Features:
 * - Configurable frame rate (FPS) and quality
 * - Progress callbacks for long encodings
 * - Automatic worker script resolution
 * - Loop control (infinite, once, or N times)
 *
 * Quality Guide:
 * - 1-10: Higher quality, larger file
 * - 10: Good balance (recommended)
 * - 20-30: Lower quality, smaller file
 *
 * @example
 * ```typescript
 * const exporter = new GifExporter({
 *   width: 400,
 *   height: 400,
 *   fps: 4,
 *   quality: 10
 * });
 *
 * const frames = states.map((state) => {
 *   // Render state to canvas
 *   return canvas;
 * });
 *
 * const blob = await exporter.exportFrames(frames, (progress) => {
 *   console.log(`${progress.percent}% done`);
 * });
 * ```
 */
export class GifExporter {
  private width: number;
  private height: number;
  private quality: number;
  private fps: number;
  private repeat: number;
  private workerScript: string;

  constructor(options: GifExportOptions = {}) {
    this.width = options.width ?? 400;
    this.height = options.height ?? 400;
    this.quality = options.quality ?? 10;
    this.fps = options.fps ?? 4; // 4 FPS for smooth but reasonable size
    this.repeat = options.repeat ?? 0; // loop once by default
    // Note: workerScript can be provided if needed, but gif.js will use default if not specified
    this.workerScript = options.workerScript ?? "";
  }

  /**
   * Export canvas frames to animated GIF
   */
  async exportFrames(
    frames: HTMLCanvasElement[],
    onProgress?: (progress: ExportProgress) => void,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const gifOptions: {
        workers: number;
        quality: number;
        width: number;
        height: number;
        repeat: number;
        workerScript?: string;
      } = {
        workers: 2,
        quality: this.quality,
        width: this.width,
        height: this.height,
        repeat: this.repeat,
      };

      // Only add workerScript if explicitly provided
      if (this.workerScript) {
        gifOptions.workerScript = this.workerScript;
      }

      const gif = new GIF(gifOptions);

      const delay = 1000 / this.fps; // milliseconds per frame

      // Add all frames
      for (const canvas of frames) {
        gif.addFrame(canvas, { delay, copy: true });
      }

      // Progress callback
      gif.on("progress", (percent: number) => {
        if (onProgress) {
          onProgress({
            percent: Math.round(percent * 100),
            currentFrame: Math.floor(percent * frames.length),
            totalFrames: frames.length,
          });
        }
      });

      // Finished callback
      gif.on("finished", (blob: Blob) => {
        resolve(blob);
      });

      // Error callback
      gif.on("error", (error: Error) => {
        reject(error);
      });

      // Start rendering
      gif.render();
    });
  }

  /**
   * Download GIF blob as file
   */
  downloadGif(blob: Blob, filename: string = "animation.gif"): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Capture single canvas frame as ImageData
   */
  captureFrame(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = this.width;
    captureCanvas.height = this.height;
    const ctx = captureCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get 2D context for frame capture");
    }

    ctx.drawImage(canvas, 0, 0, this.width, this.height);
    return captureCanvas;
  }

  /**
   * Set FPS for animation
   */
  setFps(fps: number): void {
    this.fps = Math.max(1, Math.min(30, fps)); // clamp between 1-30
  }

  /**
   * Set quality (1-30, lower is better)
   */
  setQuality(quality: number): void {
    this.quality = Math.max(1, Math.min(30, quality));
  }
}
