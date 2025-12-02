/**
 * PlaygroundCanvas - Canvas output panel for the Playground
 *
 * Displays the canvas for genome execution output with clear and export controls.
 */

import type { ReactElement } from "react";
import { forwardRef, memo } from "react";
import type { ExampleWithKey } from "@/hooks/useExamples";

/** Generate stable keys for concepts that may repeat */
function getConceptKeys(concepts: string[]): string[] {
  const counts = new Map<string, number>();
  return concepts.map((concept) => {
    const count = counts.get(concept) ?? 0;
    counts.set(concept, count + 1);
    return count === 0 ? concept : `${concept}-${count}`;
  });
}

function ExampleInfo({ example }: { example: ExampleWithKey }): ReactElement {
  const conceptKeys = getConceptKeys(example.concepts);
  return (
    <div className="border-t border-dark-border px-4 py-3">
      <h3 className="font-medium text-dark-text">{example.title}</h3>
      <p className="mt-1 text-sm text-dark-text/70">{example.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
          {example.difficulty}
        </span>
        {example.concepts.map((concept, idx) => (
          <span
            className="rounded-full bg-dark-surface px-2 py-0.5 text-xs text-dark-text"
            key={conceptKeys[idx]}
          >
            {concept}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface PlaygroundCanvasProps {
  /** Canvas width (default 400, will be constrained by container) */
  width?: number;
  /** Canvas height (default 400, will be constrained by container) */
  height?: number;
  /** Callback to clear canvas */
  onClear: () => void;
  /** Callback to export canvas as PNG */
  onExportPNG: () => void;
  /** Currently selected example (for info display) */
  selectedExample: ExampleWithKey | null;
}

export const PlaygroundCanvas = memo(
  forwardRef<HTMLCanvasElement, PlaygroundCanvasProps>(
    function PlaygroundCanvas(
      { width = 400, height = 400, onClear, onExportPNG, selectedExample },
      ref,
    ) {
      return (
        <div className="flex min-h-[300px] flex-1 flex-col bg-dark-bg md:min-h-0">
          {/* Header with controls */}
          <div className="flex items-center justify-between border-b border-dark-border px-4 py-2">
            <span className="text-sm text-dark-text md:text-base">Output</span>
            <div className="flex gap-2">
              <button
                aria-label="Clear canvas"
                className="min-h-[44px] rounded-md px-3 py-2 text-sm text-dark-text hover:bg-dark-surface"
                onClick={onClear}
                type="button"
              >
                Clear
              </button>
              <button
                aria-label="Export canvas as PNG"
                className="min-h-[44px] rounded-md px-3 py-2 text-sm text-dark-text hover:bg-dark-surface"
                onClick={onExportPNG}
                type="button"
              >
                Export PNG
              </button>
            </div>
          </div>

          {/* Canvas container - responsive with max constraints */}
          <div className="flex flex-1 items-center justify-center p-2 sm:p-4">
            <canvas
              aria-label="Genome execution output"
              className="max-h-full max-w-full rounded-lg border border-border bg-surface shadow-lg"
              height={height}
              ref={ref}
              role="img"
              style={{ aspectRatio: `${width}/${height}` }}
              width={width}
            />
          </div>

          {/* Example info (if selected) */}
          {selectedExample && <ExampleInfo example={selectedExample} />}
        </div>
      );
    },
  ),
);

export default PlaygroundCanvas;
