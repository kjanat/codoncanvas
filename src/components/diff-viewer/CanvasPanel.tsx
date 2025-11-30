/**
 * CanvasPanel - Renders a genome to canvas
 */

import { type ReactElement, useEffect, useRef, useState } from "react";

import { Canvas2DRenderer } from "@/core";
import { CodonLexer } from "@/core/lexer";
import { CodonVM } from "@/core/vm";

interface CanvasPanelProps {
  genome: string;
  label: string;
  width: number;
  height: number;
  /** Called when rendering fails with error details */
  onRenderError?: (error: Error, genome: string) => void;
}

function renderGenome(canvas: HTMLCanvasElement, genome: string): Error | null {
  try {
    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(genome);
    const renderer = new Canvas2DRenderer(canvas);
    const vm = new CodonVM(renderer);
    vm.run(tokens);
    return null;
  } catch (err) {
    return err instanceof Error ? err : new Error(String(err));
  }
}

export function CanvasPanel({
  genome,
  label,
  width,
  height,
  onRenderError,
}: CanvasPanelProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderError, setRenderError] = useState<Error | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      const error = renderGenome(canvas, genome);
      if (error) {
        setRenderError(error);
        console.warn("Render error:", error);
        onRenderError?.(error, genome);
      } else {
        setRenderError(null);
      }
    }
  }, [genome, width, height, onRenderError]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-text-muted">{label}</span>
      {renderError ? (
        <div
          className="flex items-center justify-center rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700"
          style={{ width, height }}
        >
          Render failed: {renderError.message}
        </div>
      ) : (
        <canvas
          className="rounded-lg border border-border bg-white"
          height={height}
          ref={canvasRef}
          width={width}
        />
      )}
    </div>
  );
}
