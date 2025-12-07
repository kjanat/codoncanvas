/**
 * CanvasPreview - Small canvas preview for genome visualization
 *
 * Renders a genome to a small canvas for use in gallery/lists.
 * Uses useRenderGenome hook for consistent rendering across the app.
 */

import type { ReactElement } from "react";
import { memo, useEffect, useRef, useState } from "react";

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
  /** Test ID for E2E testing */
  "data-testid"?: string;
  /** Accessible label for screen readers (default: "Genome visualization") */
  "aria-label"?: string;
}

/**
 * Memoized canvas preview component.
 * Uses React.memo for shallow prop comparison to prevent unnecessary re-renders.
 */
export const CanvasPreview = memo(function CanvasPreview({
  genome,
  width = 150,
  height = 150,
  className = "",
  "data-testid": testId,
  "aria-label": ariaLabel = "Genome visualization",
}: CanvasPreviewProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const { render } = useRenderGenome();

  // Re-render when genome/dimensions/theme change
  // Note: render is stable unless theme (isDark) changes via useRenderGenome
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setIsRendered(false);
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      // Render genome (auto-clears with correct background)
      const success = render(genome, canvas);
      setIsRendered(success);
    }
  }, [genome, width, height, render]);

  return (
    <canvas
      aria-label={ariaLabel}
      className={className}
      data-rendered={isRendered}
      data-testid={testId}
      height={height}
      ref={canvasRef}
      role="img"
      width={width}
    />
  );
});

export default CanvasPreview;
