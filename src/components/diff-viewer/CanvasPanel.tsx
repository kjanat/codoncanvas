/**
 * CanvasPanel - Renders a genome to canvas using ref callback
 */

import { Canvas2DRenderer } from "@/core";
import { CodonLexer } from "@/core/lexer";
import { CodonVM } from "@/core/vm";

interface CanvasPanelProps {
  genome: string;
  label: string;
  width: number;
  height: number;
}

function renderGenome(canvas: HTMLCanvasElement, genome: string): void {
  try {
    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(genome);
    const renderer = new Canvas2DRenderer(canvas);
    const vm = new CodonVM(renderer);
    vm.run(tokens);
  } catch (err) {
    console.warn("Render error:", err);
  }
}

export function CanvasPanel({
  genome,
  label,
  width,
  height,
}: CanvasPanelProps) {
  // Ref callback - runs when canvas mounts
  function canvasRef(canvas: HTMLCanvasElement | null): void {
    if (canvas) {
      renderGenome(canvas, genome);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-text-muted">{label}</span>
      <canvas
        className="rounded-lg border border-border bg-white"
        height={height}
        ref={canvasRef}
        width={width}
      />
    </div>
  );
}
