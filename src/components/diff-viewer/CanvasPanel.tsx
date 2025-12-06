/**
 * CanvasPanel - Renders a genome to canvas
 *
 * Used in DiffViewer to show side-by-side genome comparisons.
 * Uses useRenderGenome hook for consistent rendering.
 */

import { type ReactElement, useEffect, useRef, useState } from "react";

import { useRenderGenome } from "@/hooks";

interface CanvasPanelProps {
  genome: string;
  label: string;
  width: number;
  height: number;
  /** Called when rendering fails with error details */
  onRenderError?: (error: Error, genome: string) => void;
}

export function CanvasPanel({
  genome,
  label,
  width,
  height,
  onRenderError,
}: CanvasPanelProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const { renderWithResult } = useRenderGenome();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      const result = renderWithResult(genome, canvas);
      if (!result.success && result.error) {
        setRenderError(result.error);
        onRenderError?.(new Error(result.error), genome);
      } else {
        setRenderError(null);
      }
    }
  }, [genome, width, height, renderWithResult, onRenderError]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-text-muted">{label}</span>
      {renderError ? (
        <div
          className="flex items-center justify-center rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700"
          style={{ width, height }}
        >
          Render failed: {renderError}
        </div>
      ) : (
        <canvas
          className="rounded-lg border border-border bg-surface"
          height={height}
          ref={canvasRef}
          width={width}
        />
      )}
    </div>
  );
}
