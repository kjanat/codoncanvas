import { useEffect, useRef } from "react";
import { useRenderGenome } from "@/hooks/useRenderGenome";
import type { Individual } from "./types";

interface PopulationGridProps {
  population: Individual[];
  selectedId: string | null;
  onSelect: (individual: Individual) => void;
}

export function PopulationGrid({
  population,
  selectedId,
  onSelect,
}: PopulationGridProps) {
  const { render, isDark: _isDark } = useRenderGenome();
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Re-render all canvases when population or theme changes
  useEffect(() => {
    canvasRefs.current.forEach((canvas, id) => {
      const ind = population.find((p) => p.id === id);
      if (ind) {
        render(ind.genome, canvas);
      }
    });
  }, [population, render]);

  const setCanvasRef = (id: string, el: HTMLCanvasElement | null) => {
    if (el) {
      canvasRefs.current.set(id, el);
      const ind = population.find((p) => p.id === id);
      if (ind) {
        render(ind.genome, el);
      }
    } else {
      canvasRefs.current.delete(id);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {population.map((ind, i) => (
        <button
          className={`relative rounded-lg border-2 p-1 transition-all ${
            selectedId === ind.id
              ? "border-primary ring-2 ring-primary/30"
              : "border-border hover:border-primary/50"
          }`}
          key={ind.id}
          onClick={() => onSelect(ind)}
          type="button"
        >
          <canvas
            className="w-full rounded"
            height={80}
            ref={(el) => setCanvasRef(ind.id, el)}
            width={80}
          />
          {i < 2 && (
            <span className="absolute right-1 top-1 rounded bg-yellow-400 px-1 text-xs font-bold">
              E
            </span>
          )}
          <div className="mt-1 text-xs text-text-muted">
            {(ind.fitness * 100).toFixed(0)}%
          </div>
        </button>
      ))}
    </div>
  );
}
