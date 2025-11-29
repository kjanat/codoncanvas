import { useEffect, useRef } from "react";
import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
import { compareGenomes } from "@/genetics/mutations";

interface DiffViewerProps {
  original: string;
  mutated: string;
  title?: string;
  showCanvas?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function DiffViewer({
  original,
  mutated,
  title = "Genome Comparison",
  showCanvas = true,
  canvasWidth = 300,
  canvasHeight = 300,
}: DiffViewerProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const mutatedCanvasRef = useRef<HTMLCanvasElement>(null);

  const comparison = compareGenomes(original, mutated);
  const differences = comparison.differences;

  useEffect(() => {
    if (!showCanvas) return;

    const renderGenome = (genome: string, canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      try {
        const lexer = new CodonLexer();
        const tokens = lexer.tokenize(genome);
        const renderer = new Canvas2DRenderer(canvas);
        const vm = new CodonVM(renderer);
        vm.run(tokens);
      } catch (err) {
        console.warn("Render error:", err);
      }
    };

    renderGenome(original, originalCanvasRef.current);
    renderGenome(mutated, mutatedCanvasRef.current);
  }, [original, mutated, showCanvas]);

  const renderCodons = (
    codons: string[],
    highlights: Array<{ pos: number; type: "added" | "removed" }>,
  ) => {
    return codons.map((codon, i) => {
      const highlight = highlights.find((h) => h.pos === i);
      let className = "inline-block px-1 rounded mx-0.5";
      if (highlight?.type === "removed") {
        className += " bg-red-100 border border-red-400 text-red-900";
      } else if (highlight?.type === "added") {
        className += " bg-green-100 border border-green-400 text-green-900";
      } else {
        className += " bg-gray-100 text-gray-800";
      }

      return (
        <span className={className} key={`${i}-${codon}`}>
          {codon}
        </span>
      );
    });
  };

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="font-medium text-text">{differences.length}</span>
          <span>codon{differences.length !== 1 ? "s" : ""} changed</span>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Original Panel */}
        <div className="rounded-lg border border-border bg-gray-50 overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 border-b border-border text-center">
            Original
          </div>
          <div className="p-4 font-mono text-sm leading-loose min-h-[100px]">
            {renderCodons(
              comparison.originalCodons,
              differences.map((d) => ({ pos: d.position, type: "removed" })),
            )}
          </div>
        </div>

        {/* Mutated Panel */}
        <div className="rounded-lg border border-border bg-gray-50 overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 border-b border-border text-center">
            Mutated
          </div>
          <div className="p-4 font-mono text-sm leading-loose min-h-[100px]">
            {renderCodons(
              comparison.mutatedCodons,
              differences.map((d) => ({ pos: d.position, type: "added" })),
            )}
          </div>
        </div>
      </div>

      {showCanvas && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-text-muted">Original Output</span>
            <canvas
              className="rounded-lg border border-border bg-white"
              height={canvasHeight}
              ref={originalCanvasRef}
              width={canvasWidth}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-text-muted">Mutated Output</span>
            <canvas
              className="rounded-lg border border-border bg-white"
              height={canvasHeight}
              ref={mutatedCanvasRef}
              width={canvasWidth}
            />
          </div>
        </div>
      )}

      {differences.length > 0 ? (
        <div className="rounded-lg border border-border bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-bold text-text">
            Changes at codon level:
          </h4>
          <ul className="space-y-1">
            {differences.map((diff) => (
              <li
                className="text-sm text-text bg-white p-2 rounded border border-border"
                key={diff.position}
              >
                <span className="font-mono text-gray-500">
                  Pos {diff.position}:
                </span>{" "}
                <code className="bg-red-100 text-red-900 px-1 rounded border border-red-200">
                  {diff.original || "(deleted)"}
                </code>{" "}
                →{" "}
                <code className="bg-green-100 text-green-900 px-1 rounded border border-green-200">
                  {diff.mutated || "(inserted)"}
                </code>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center text-text-muted py-4">
          No differences found
        </div>
      )}
    </div>
  );
}
