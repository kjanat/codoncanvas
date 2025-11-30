/**
 * CanvasPreview - Small canvas preview for genome visualization
 *
 * Renders a genome to a small canvas for use in gallery/lists.
 * Automatically handles errors gracefully.
 */

import { memo, useEffect, useRef } from "react";
import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";

interface CanvasPreviewProps {
  /** Genome string to render */
  genome: string;
  /** Canvas width (default: 150) */
  width?: number;
  /** Canvas height (default: 150) */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

function renderGenome(
  canvas: HTMLCanvasElement,
  genome: string,
  width: number,
  height: number,
): void {
  try {
    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(genome);
    const renderer = new Canvas2DRenderer(canvas);
    const vm = new CodonVM(renderer);
    vm.run(tokens);
  } catch {
    // Clear canvas on error
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#6c757d";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Preview unavailable", width / 2, height / 2);
    }
  }
}

/**
 * Memoized canvas preview component.
 * Only re-renders when genome changes.
 */
export const CanvasPreview = memo(function CanvasPreview({
  genome,
  width = 150,
  height = 150,
  className = "",
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Re-render when genome/dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      renderGenome(canvas, genome, width, height);
    }
  }, [genome, width, height]);

  return (
    <canvas
      className={`bg-white ${className}`}
      height={height}
      ref={canvasRef}
      width={width}
    />
  );
});

export default CanvasPreview;
