/**
 * PlaygroundCanvas - Canvas output panel for the Playground
 *
 * Displays the canvas for genome execution output with clear and export controls.
 */

import { forwardRef, memo } from "react";
import type { ExampleWithKey } from "@/hooks/useExamples";

// --- Sub-component: Example Info ---

function ExampleInfo({ example }: { example: ExampleWithKey }) {
  return (
    <div className="border-t border-dark-border px-4 py-3">
      <h3 className="font-medium text-dark-text">{example.title}</h3>
      <p className="mt-1 text-sm text-dark-text/70">{example.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
          {example.difficulty}
        </span>
        {example.concepts.map((concept) => (
          <span
            className="rounded-full bg-dark-surface px-2 py-0.5 text-xs text-dark-text"
            key={concept}
          >
            {concept}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Main Component ---

export interface PlaygroundCanvasProps {
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
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
      { width, height, onClear, onExportPNG, selectedExample },
      ref,
    ) {
      return (
        <div className="flex flex-1 flex-col bg-dark-bg">
          {/* Header with controls */}
          <div className="flex items-center justify-between border-b border-dark-border px-4 py-2">
            <span className="text-sm text-dark-text">Output</span>
            <div className="flex gap-2">
              <button
                aria-label="Clear canvas"
                className="rounded-md px-3 py-1 text-sm text-dark-text hover:bg-dark-surface"
                onClick={onClear}
                type="button"
              >
                Clear
              </button>
              <button
                aria-label="Export canvas as PNG"
                className="rounded-md px-3 py-1 text-sm text-dark-text hover:bg-dark-surface"
                onClick={onExportPNG}
                type="button"
              >
                Export PNG
              </button>
            </div>
          </div>

          {/* Canvas container */}
          <div className="flex flex-1 items-center justify-center p-4">
            <canvas
              aria-label="Genome execution output"
              className="rounded-lg border border-dark-border bg-surface shadow-lg"
              height={height}
              ref={ref}
              role="img"
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
