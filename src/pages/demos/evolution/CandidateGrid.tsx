import { useEffect, useRef } from "react";
import { useRenderGenome } from "@/hooks/useRenderGenome";
import type { Candidate } from "./types";

interface CandidateGridProps {
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}

export function CandidateGrid({ candidates, onSelect }: CandidateGridProps) {
  const { render, isDark: _isDark } = useRenderGenome();
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  // Re-render all canvases when theme changes
  useEffect(() => {
    canvasRefs.current.forEach((canvas, id) => {
      const candidate = candidates.find((c) => c.id === id);
      if (candidate) {
        render(candidate.genome, canvas);
      }
    });
  }, [candidates, render]);

  const setCanvasRef = (id: number, el: HTMLCanvasElement | null) => {
    if (el) {
      canvasRefs.current.set(id, el);
      const candidate = candidates.find((c) => c.id === id);
      if (candidate) {
        render(candidate.genome, el);
      }
    } else {
      canvasRefs.current.delete(id);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-text">
        Select the Fittest Candidate
      </h2>
      <p className="mb-4 text-sm text-text-muted">
        Click on the candidate that best matches your target phenotype. It will
        become the parent for the next generation.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate, i) => (
          <button
            className="group rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
            key={candidate.id}
            onClick={() => onSelect(candidate)}
            type="button"
          >
            <canvas
              className="mx-auto rounded-lg border border-border bg-surface"
              height={180}
              ref={(el) => setCanvasRef(candidate.id, el)}
              width={180}
            />
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {candidate.mutationType}
                </span>
                <span className="text-sm font-medium text-text group-hover:text-primary">
                  Candidate {i + 1}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-text-muted">
                {candidate.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
