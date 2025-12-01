/**
 * GIF Exporter Tests with Mocked gif.js
 *
 * Tests the exportFrames method by mocking the gif.js library
 * to simulate GIF encoding without requiring Web Workers.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { ExportProgress } from "@/exporters/gif-exporter";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "@/tests/test-utils/canvas-mock";

// Track MockGIF instances for assertions
let lastMockGifInstance: MockGIF | null = null;
let mockGifConstructorCalls: Array<Record<string, unknown>> = [];

// Mock GIF class that simulates gif.js behavior
class MockGIF {
  options: Record<string, unknown>;
  frames: Array<{
    canvas: HTMLCanvasElement;
    opts: { delay: number; copy: boolean };
  }> = [];
  handlers: Record<string, (...args: unknown[]) => void> = {};
  private shouldError = false;

  constructor(options: Record<string, unknown>) {
    this.options = options;
    mockGifConstructorCalls.push(options);
    lastMockGifInstance = this;
  }

  addFrame(canvas: HTMLCanvasElement, opts: { delay: number; copy: boolean }) {
    this.frames.push({ canvas, opts });
  }

  on(event: string, handler: (...args: unknown[]) => void) {
    this.handlers[event] = handler;
  }

  render() {
    // Simulate async rendering
    setTimeout(() => {
      if (this.shouldError) {
        if (this.handlers.error) {
          this.handlers.error(new Error("Mock GIF encoding error"));
        }
        return;
      }

      // Simulate progress callbacks
      if (this.handlers.progress) {
        this.handlers.progress(0.25);
        this.handlers.progress(0.5);
        this.handlers.progress(0.75);
        this.handlers.progress(1.0);
      }

      // Simulate finished callback with mock blob
      if (this.handlers.finished) {
        this.handlers.finished(
          new Blob(["mock-gif-data"], { type: "image/gif" }),
        );
      }
    }, 0);
  }

  // Test helper to trigger error
  triggerError() {
    this.shouldError = true;
  }
}

// Mock gif.js module before importing GifExporter
mock.module("gif.js", () => ({
  default: MockGIF,
}));

// Import after mocking
import { GifExporter } from "@/exporters/gif-exporter";

describe("GifExporter with mocked gif.js", () => {
  beforeEach(() => {
    mockCanvasContext();
    lastMockGifInstance = null;
    mockGifConstructorCalls = [];
  });

  afterEach(() => {
    restoreCanvasContext();
  });

  // Helper to create mock canvas frames
  function createMockFrames(count: number): HTMLCanvasElement[] {
    return Array.from({ length: count }, () => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      return canvas;
    });
  }

  describe("exportFrames", () => {
    test("resolves with Blob when rendering completes", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      const frames = createMockFrames(3);

      const blob = await exporter.exportFrames(frames);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("image/gif");
    });

    test("passes correct options to GIF constructor", async () => {
      const exporter = new GifExporter({
        width: 200,
        height: 150,
        quality: 5,
        repeat: -1,
      });
      const frames = createMockFrames(1);

      await exporter.exportFrames(frames);

      expect(mockGifConstructorCalls).toHaveLength(1);
      const options = mockGifConstructorCalls[0];
      expect(options.width).toBe(200);
      expect(options.height).toBe(150);
      expect(options.quality).toBe(5);
      expect(options.repeat).toBe(-1);
      expect(options.workers).toBe(2);
    });

    test("includes workerScript in options when provided", async () => {
      const exporter = new GifExporter({
        width: 100,
        height: 100,
        workerScript: "/custom/gif.worker.js",
      });
      const frames = createMockFrames(1);

      await exporter.exportFrames(frames);

      expect(mockGifConstructorCalls).toHaveLength(1);
      const options = mockGifConstructorCalls[0];
      expect(options.workerScript).toBe("/custom/gif.worker.js");
    });

    test("does not include workerScript when not provided", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      const frames = createMockFrames(1);

      await exporter.exportFrames(frames);

      expect(mockGifConstructorCalls).toHaveLength(1);
      const options = mockGifConstructorCalls[0];
      expect(options.workerScript).toBeUndefined();
    });

    test("adds all frames with correct delay based on FPS", async () => {
      const exporter = new GifExporter({ width: 100, height: 100, fps: 10 });
      const frames = createMockFrames(5);

      await exporter.exportFrames(frames);

      expect(lastMockGifInstance).not.toBeNull();
      expect(lastMockGifInstance!.frames).toHaveLength(5);

      // Verify delay = 1000 / fps = 1000 / 10 = 100ms
      for (const frame of lastMockGifInstance!.frames) {
        expect(frame.opts.delay).toBe(100);
        expect(frame.opts.copy).toBe(true);
      }
    });

    test("calculates delay correctly for different FPS values", async () => {
      // Test with 4 FPS (default) = 250ms delay
      const exporter4fps = new GifExporter({ width: 100, height: 100, fps: 4 });
      await exporter4fps.exportFrames(createMockFrames(1));
      expect(lastMockGifInstance!.frames[0].opts.delay).toBe(250);

      // Test with 25 FPS = 40ms delay
      mockGifConstructorCalls = [];
      const exporter25fps = new GifExporter({
        width: 100,
        height: 100,
        fps: 25,
      });
      await exporter25fps.exportFrames(createMockFrames(1));
      expect(lastMockGifInstance!.frames[0].opts.delay).toBe(40);
    });

    test("calls onProgress callback during rendering", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      const frames = createMockFrames(4);
      const progressCalls: ExportProgress[] = [];

      await exporter.exportFrames(frames, (progress) => {
        progressCalls.push({ ...progress });
      });

      expect(progressCalls.length).toBeGreaterThan(0);

      // Check progress structure
      for (const progress of progressCalls) {
        expect(progress.percent).toBeGreaterThanOrEqual(0);
        expect(progress.percent).toBeLessThanOrEqual(100);
        expect(progress.currentFrame).toBeGreaterThanOrEqual(0);
        expect(progress.totalFrames).toBe(4);
      }
    });

    test("progress callback receives correct percent values", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      const frames = createMockFrames(4);
      const percentValues: number[] = [];

      await exporter.exportFrames(frames, (progress) => {
        percentValues.push(progress.percent);
      });

      // MockGIF sends 0.25, 0.5, 0.75, 1.0 which become 25, 50, 75, 100
      expect(percentValues).toContain(25);
      expect(percentValues).toContain(50);
      expect(percentValues).toContain(75);
      expect(percentValues).toContain(100);
    });

    test("works without onProgress callback", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      const frames = createMockFrames(2);

      // Should not throw when no callback provided
      const blob = await exporter.exportFrames(frames);

      expect(blob).toBeInstanceOf(Blob);
    });

    test("handles empty frames array", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });

      const blob = await exporter.exportFrames([]);

      expect(blob).toBeInstanceOf(Blob);
      expect(lastMockGifInstance!.frames).toHaveLength(0);
    });

    test("handles single frame", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      const frames = createMockFrames(1);

      const blob = await exporter.exportFrames(frames);

      expect(blob).toBeInstanceOf(Blob);
      expect(lastMockGifInstance!.frames).toHaveLength(1);
    });

    test("handles many frames", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      const frames = createMockFrames(100);

      const blob = await exporter.exportFrames(frames);

      expect(blob).toBeInstanceOf(Blob);
      expect(lastMockGifInstance!.frames).toHaveLength(100);
    });

    test("uses default repeat value of 0", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      await exporter.exportFrames(createMockFrames(1));

      expect(mockGifConstructorCalls[0].repeat).toBe(0);
    });

    test("uses default quality value of 10", async () => {
      const exporter = new GifExporter({ width: 100, height: 100 });
      await exporter.exportFrames(createMockFrames(1));

      expect(mockGifConstructorCalls[0].quality).toBe(10);
    });
  });

  describe("exportFrames error handling", () => {
    test("rejects when GIF encoding fails", async () => {
      // Create a custom mock that triggers error
      const errorMockGIF = class extends MockGIF {
        render() {
          setTimeout(() => {
            if (this.handlers.error) {
              this.handlers.error(new Error("Encoding failed"));
            }
          }, 0);
        }
      };

      // Temporarily replace the mock
      mock.module("gif.js", () => ({ default: errorMockGIF }));

      // Re-import to get new mock
      const { GifExporter: ErrorGifExporter } = await import(
        "@/exporters/gif-exporter"
      );
      const exporter = new ErrorGifExporter({ width: 100, height: 100 });

      expect(exporter.exportFrames(createMockFrames(1))).rejects.toThrow(
        "Encoding failed",
      );

      // Restore original mock
      mock.module("gif.js", () => ({ default: MockGIF }));
    });
  });
});
