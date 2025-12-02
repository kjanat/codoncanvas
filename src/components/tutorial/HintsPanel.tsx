import type { ReactElement } from "react";

interface HintsPanelProps {
  hints: string[];
  hintsRevealed: number;
  onRevealHint: () => void;
}

export function HintsPanel({
  hints,
  hintsRevealed,
  onRevealHint,
}: HintsPanelProps): ReactElement {
  // Clamp to valid range
  const revealedCount = Math.min(Math.max(0, hintsRevealed), hints.length);
  const hasMoreHints = revealedCount < hints.length;

  // No hints available
  if (hints.length === 0) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 md:p-4">
        <h3 className="font-semibold text-warning-dark">Hints</h3>
        <p className="mt-2 text-sm text-text-muted md:mt-3">
          No hints available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 md:p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 md:mb-3">
        <h3 className="font-semibold text-warning-dark">Hints</h3>
        {hasMoreHints && (
          <button
            className="min-h-[44px] rounded-md border border-warning/40 bg-warning/10 px-3 py-1 text-sm font-medium text-warning-dark hover:bg-warning/20"
            onClick={onRevealHint}
            type="button"
          >
            Show hint ({revealedCount}/{hints.length})
          </button>
        )}
      </div>
      {revealedCount > 0 ? (
        <ul className="space-y-2 text-sm text-text-light">
          {hints.slice(0, revealedCount).map((hint, hintIndex) => (
            <li
              className="flex gap-2"
              key={`${hintIndex}-${hint.slice(0, 20)}`}
            >
              <span className="text-warning">*</span>
              {hint}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">
          Stuck? Click above to reveal a hint.
        </p>
      )}
    </div>
  );
}
