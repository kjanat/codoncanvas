/**
 * CanvasPreview - Small canvas preview for genome visualization
 *
 * Renders a genome to a small canvas for use in gallery/lists.
 * Automatically handles errors gracefully.
 */

import type { ReactElement } from "react";
import { memo, useEffect, useRef } from "react";
import { type ResolvedTheme, useTheme } from "@/contexts";
import { Canvas2DRenderer } from "@/core";
import { CodonLexer } from "@/core/lexer";
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
  /** Optional theme override - if not provided, uses useTheme hook */
  theme?: ResolvedTheme;
}

function renderGenome(
  canvas: HTMLCanvasElement,
  genome: string,
  width: number,
  height: number,
  isDark: boolean,
): void {
  try {
    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(genome);
    const renderer = new Canvas2DRenderer(canvas);
    // Set default color based on theme
    renderer.setColor(0, 0, isDark ? 100 : 0);
    const vm = new CodonVM(renderer);
    vm.run(tokens);
  } catch (_err) {
    // Clear canvas on error
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = isDark ? "#2d2d30" : "#f8f9fa";
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
 * Only re-renders when genome or theme changes.
 */
export const CanvasPreview = memo(function CanvasPreview({
  genome,
  width = 150,
  height = 150,
  className = "",
  theme: themeProp,
}: CanvasPreviewProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  // Use prop if provided, otherwise use hook value
  const effectiveTheme = themeProp ?? resolvedTheme;
  const isDark = effectiveTheme === "dark";

  // Re-render when genome/dimensions/theme change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      renderGenome(canvas, genome, width, height, isDark);
    }
  }, [genome, width, height, isDark]);

  return (
    <canvas
      className={className}
      height={height}
      ref={canvasRef}
      width={width}
    />
  );
});

export default CanvasPreview;
