/**
 * CanvasPreview - Small canvas preview for genome visualization
 *
 * Renders a genome to a small canvas for use in gallery/lists.
 * Uses useRenderGenome hook for consistent rendering across the app.
 */

import type { ReactElement } from "react";
import { memo, useEffect, useRef } from "react";

import { useRenderGenome } from "@/hooks";

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

/**
 * Memoized canvas preview component.
 * Only re-renders when genome changes.
 */
export const CanvasPreview = memo(function CanvasPreview({
  genome,
  width = 150,
  height = 150,
  className = "",
}: CanvasPreviewProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { render } = useRenderGenome();

  // Re-render when genome/dimensions/theme change
  // Note: render function changes when isDark changes (from useRenderGenome)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      // Render genome (auto-clears with correct background)
      render(genome, canvas);
    }
  }, [genome, width, height, render]);

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
