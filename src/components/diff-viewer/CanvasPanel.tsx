/**
 * CanvasPanel - Renders a genome to canvas
 *
 * Used in DiffViewer to show side-by-side genome comparisons.
 * Uses useRenderGenome hook for consistent rendering.
 */

import {
  type ReactElement,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

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
  const [isRendered, setIsRendered] = useState(false);
  const { renderWithResult } = useRenderGenome();

  // Stable event handler that doesn't trigger effect re-runs
  const handleRenderError = useEffectEvent(
    (error: Error, genomeStr: string) => {
      onRenderError?.(error, genomeStr);
    },
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setIsRendered(false);
      canvas.width = width;
      canvas.height = height;
      const result = renderWithResult(genome, canvas);
      if (!result.success) {
        const message = result.error ?? "Render failed";
        setRenderError(message);
        handleRenderError(new Error(message), genome);
      } else {
        setRenderError(null);
        setIsRendered(true);
      }
    }
  }, [genome, width, height, renderWithResult]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-text-muted">{label}</span>
      {renderError ? (
        <div
          aria-label={`${label} - render failed`}
          className="flex items-center justify-center rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
          style={{ width, height }}
        >
          Render failed: {renderError}
        </div>
      ) : (
        <canvas
          aria-label={label}
          className="rounded-lg border border-border bg-surface"
          data-rendered={isRendered}
          height={height}
          ref={canvasRef}
          role="img"
          width={width}
        />
      )}
    </div>
  );
}
