import { describe, expect, it } from "bun:test";
import { renderHook } from "@testing-library/react";

import { useLineChart } from "@/hooks/useLineChart";

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
});
