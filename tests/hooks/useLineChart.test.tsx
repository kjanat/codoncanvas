import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { useLineChart } from "@/hooks/useLineChart";

afterEach(() => {
  cleanup();
});

// Mock canvas context (kept for potential future use)
const _mockContext = {
  clearRect: mock(() => {}),
  fillRect: mock(() => {}),
  beginPath: mock(() => {}),
  moveTo: mock(() => {}),
  lineTo: mock(() => {}),
  stroke: mock(() => {}),
  strokeStyle: "",
  fillStyle: "",
  lineWidth: 1,
};

function TestChart({
  series,
  bgColor,
  gridColor,
  gridLines,
}: {
  series: { data: number[]; color: string; width?: number }[];
  bgColor?: string;
  gridColor?: string;
  gridLines?: number;
}) {
  const ref = useLineChart({ series, bgColor, gridColor, gridLines });
  return <canvas data-testid="chart" height={100} ref={ref} width={200} />;
}

describe("useLineChart", () => {
  test("returns a ref that can be attached to canvas", () => {
    const { getByTestId } = render(
      <TestChart series={[{ data: [0.1, 0.5], color: "#000" }]} />,
    );
    const canvas = getByTestId("chart");
    expect(canvas).toBeDefined();
    expect(canvas.tagName).toBe("CANVAS");
  });

  test("renders with empty series without error", () => {
    expect(() => {
      render(<TestChart series={[]} />);
    }).not.toThrow();
  });

  test("renders with single point series (no line drawn)", () => {
    expect(() => {
      render(<TestChart series={[{ data: [0.5], color: "#000" }]} />);
    }).not.toThrow();
  });

  test("renders multiple series", () => {
    expect(() => {
      render(
        <TestChart
          series={[
            { data: [0.1, 0.3, 0.5], color: "#f00" },
            { data: [0.2, 0.4, 0.6], color: "#0f0", width: 3 },
          ]}
        />,
      );
    }).not.toThrow();
  });

  test("accepts optional bgColor", () => {
    expect(() => {
      render(
        <TestChart
          bgColor="#fff"
          series={[{ data: [0.1, 0.5], color: "#000" }]}
        />,
      );
    }).not.toThrow();
  });

  test("accepts optional gridColor", () => {
    expect(() => {
      render(
        <TestChart
          gridColor="#ccc"
          series={[{ data: [0.1, 0.5], color: "#000" }]}
        />,
      );
    }).not.toThrow();
  });

  test("accepts optional gridLines count", () => {
    expect(() => {
      render(
        <TestChart
          gridLines={8}
          series={[{ data: [0.1, 0.5], color: "#000" }]}
        />,
      );
    }).not.toThrow();
  });

  test("handles varying data lengths across series", () => {
    expect(() => {
      render(
        <TestChart
          series={[
            { data: [0.1, 0.2, 0.3, 0.4], color: "#f00" },
            { data: [0.5, 0.6], color: "#0f0" },
          ]}
        />,
      );
    }).not.toThrow();
  });
});
