import { useEffect, useRef } from "react";

interface LineSeries {
  /** Data points (0-1 range for y values) */
  data: number[];
  /** Line color */
  color: string;
  /** Line width (default: 2) */
  width?: number;
}

interface UseLineChartOptions {
  /** Array of line series to draw */
  series: LineSeries[];
  /** Grid line color (default: #e5e7eb) */
  gridColor?: string;
  /** Background color (optional) */
  bgColor?: string;
  /** Number of horizontal grid lines (default: 4, creates 5 sections) */
  gridLines?: number;
}

/**
 * Hook for drawing simple line charts on a canvas.
 * Returns a ref to attach to a canvas element.
 *
 * @example
 * const chartRef = useLineChart({
 *   series: [
 *     { data: [0.1, 0.3, 0.5], color: "#22c55e", width: 2 },
 *     { data: [0.2, 0.4, 0.3], color: "#94a3b8", width: 1 },
 *   ],
 * });
 * return <canvas ref={chartRef} width={400} height={200} />;
 */
export function useLineChart({
  series,
  gridColor = "#e5e7eb",
  bgColor,
  gridLines = 4,
}: UseLineChartOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background fill
    if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Draw grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = (i / gridLines) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Find max data length for x scaling
    const maxLen = Math.max(...series.map((s) => s.data.length), 2);
    const xScale = width / (maxLen - 1);

    // Draw each series
    for (const line of series) {
      if (line.data.length < 2) continue;

      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width ?? 2;
      ctx.beginPath();

      line.data.forEach((value, i) => {
        const x = i * xScale;
        const y = height * (1 - value);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    }
  }, [series, gridColor, bgColor, gridLines]);

  return canvasRef;
}
