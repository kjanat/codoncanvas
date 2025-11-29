/**
 * useRenderGenome - React hook for rendering genomes to canvas
 *
 * Provides a memoized function to render genome strings to canvas elements.
 * Centralizes the Lexer -> Renderer -> VM pipeline used across demos.
 */

import { useCallback, useMemo } from "react";
import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";

/** Result of a render attempt */
export interface RenderResult {
  /** Whether rendering succeeded */
  success: boolean;
  /** Error message if rendering failed */
  error: string | null;
}

/** Return type of useRenderGenome hook */
export interface UseRenderGenomeReturn {
  /** Render genome to canvas, returns success boolean */
  render: (genome: string, canvas: HTMLCanvasElement | null) => boolean;
  /** Render genome with detailed result */
  renderWithResult: (
    genome: string,
    canvas: HTMLCanvasElement | null,
  ) => RenderResult;
  /** Clear canvas to white */
  clear: (canvas: HTMLCanvasElement | null) => void;
  /** Lexer instance for advanced use */
  lexer: CodonLexer;
}

/**
 * React hook for rendering genome strings to canvas elements.
 *
 * @example
 * ```tsx
 * function GenomePreview({ genome }) {
 *   const canvasRef = useRef<HTMLCanvasElement>(null);
 *   const { render } = useRenderGenome();
 *
 *   useEffect(() => {
 *     render(genome, canvasRef.current);
 *   }, [genome, render]);
 *
 *   return <canvas ref={canvasRef} width={200} height={200} />;
 * }
 * ```
 */
export function useRenderGenome(): UseRenderGenomeReturn {
  // Memoize lexer instance to avoid re-creating on every render
  const lexer = useMemo(() => new CodonLexer(), []);

  // Clear canvas to white background
  const clear = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Render genome with detailed result
  const renderWithResult = useCallback(
    (genome: string, canvas: HTMLCanvasElement | null): RenderResult => {
      if (!canvas) {
        return { success: false, error: "Canvas not available" };
      }

      try {
        const tokens = lexer.tokenize(genome);
        const renderer = new Canvas2DRenderer(canvas);
        const vm = new CodonVM(renderer);
        vm.run(tokens);
        return { success: true, error: null };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Render failed",
        };
      }
    },
    [lexer],
  );

  // Simple render returning boolean
  const render = useCallback(
    (genome: string, canvas: HTMLCanvasElement | null): boolean => {
      return renderWithResult(genome, canvas).success;
    },
    [renderWithResult],
  );

  return {
    render,
    renderWithResult,
    clear,
    lexer,
  };
}

export default useRenderGenome;
