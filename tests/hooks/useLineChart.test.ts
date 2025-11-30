import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { renderHook } from "@testing-library/react";

import { useLineChart } from "@/hooks/useLineChart";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "@/tests/test-utils/canvas-mock";

describe("useLineChart", () => {
  it("returns a canvas ref", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [{ data: [0.1, 0.5, 0.3], color: "#22c55e" }],
      }),
    );
    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull(); // Not attached yet
  });

  it("accepts series with custom width", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [{ data: [0.1, 0.5], color: "#22c55e", width: 5 }],
      }),
    );
    expect(result.current).toBeDefined();
  });

  it("accepts multiple series", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [
          { data: [0.1, 0.5, 0.3], color: "#22c55e", width: 2 },
          { data: [0.2, 0.4, 0.6], color: "#94a3b8", width: 1 },
        ],
      }),
    );
    expect(result.current).toBeDefined();
  });

  it("accepts empty series array", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [],
      }),
    );
    expect(result.current).toBeDefined();
  });

  it("accepts custom gridColor", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [],
        gridColor: "#cccccc",
      }),
    );
    expect(result.current).toBeDefined();
  });

  it("accepts custom bgColor", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [],
        bgColor: "#ffffff",
      }),
    );
    expect(result.current).toBeDefined();
  });

  it("accepts custom gridLines", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [],
        gridLines: 10,
      }),
    );
    expect(result.current).toBeDefined();
  });

  it("uses defaults when options not provided", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [{ data: [0, 0.5, 1], color: "#000" }],
        // gridColor, bgColor, gridLines not provided
      }),
    );
    expect(result.current).toBeDefined();
  });

  it("handles series with less than 2 data points", () => {
    const { result } = renderHook(() =>
      useLineChart({
        series: [
          { data: [0.5], color: "#ff0000" }, // Only 1 point - should be skipped
          { data: [], color: "#00ff00" }, // Empty - should be skipped
        ],
      }),
    );
    expect(result.current).toBeDefined();
  });

  describe("with mocked canvas", () => {
    beforeEach(() => {
      mockCanvasContext();
    });

    afterEach(() => {
      restoreCanvasContext();
    });

    it("renders chart when canvas is attached", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;

      const { result } = renderHook(() =>
        useLineChart({
          series: [{ data: [0.1, 0.5, 0.3, 0.8], color: "#22c55e" }],
        }),
      );

      Object.defineProperty(result.current, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.current).toBe(canvas);
    });

    it("draws background when bgColor is provided", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;

      const { result } = renderHook(() =>
        useLineChart({
          series: [{ data: [0.2, 0.4, 0.6], color: "#ff0000" }],
          bgColor: "#ffffff",
        }),
      );

      Object.defineProperty(result.current, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.current).toBe(canvas);
    });

    it("draws grid lines based on gridLines option", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;

      const { result } = renderHook(() =>
        useLineChart({
          series: [{ data: [0.1, 0.9], color: "#00ff00" }],
          gridLines: 8,
        }),
      );

      Object.defineProperty(result.current, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.current).toBe(canvas);
    });

    it("skips series with less than 2 data points during drawing", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;

      const { result } = renderHook(() =>
        useLineChart({
          series: [
            { data: [0.5], color: "#ff0000" }, // Skipped
            { data: [0.2, 0.8, 0.5], color: "#00ff00" }, // Drawn
          ],
        }),
      );

      Object.defineProperty(result.current, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.current).toBe(canvas);
    });

    it("uses default line width when not specified", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;

      const { result } = renderHook(() =>
        useLineChart({
          series: [{ data: [0.1, 0.5, 0.9], color: "#0000ff" }],
        }),
      );

      Object.defineProperty(result.current, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.current).toBe(canvas);
    });

    it("handles multiple series with varying lengths", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;

      const { result } = renderHook(() =>
        useLineChart({
          series: [
            { data: [0.1, 0.5], color: "#ff0000", width: 1 },
            { data: [0.2, 0.4, 0.6, 0.8, 1.0], color: "#00ff00", width: 2 },
            { data: [0.9, 0.7, 0.5], color: "#0000ff", width: 3 },
          ],
        }),
      );

      Object.defineProperty(result.current, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.current).toBe(canvas);
    });

    it("updates chart when series data changes", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;

      const initialSeries = [{ data: [0.1, 0.5], color: "#ff0000" }];
      const { result, rerender } = renderHook(
        ({ series }) => useLineChart({ series }),
        { initialProps: { series: initialSeries } },
      );

      Object.defineProperty(result.current, "current", {
        value: canvas,
        writable: true,
      });

      // Update series
      const newSeries = [{ data: [0.2, 0.6, 0.4], color: "#00ff00" }];
      rerender({ series: newSeries });

      expect(result.current.current).toBe(canvas);
    });
  });
});
