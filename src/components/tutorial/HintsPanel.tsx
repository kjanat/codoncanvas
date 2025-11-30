interface HintsPanelProps {
  hints: string[];
  hintsRevealed: number;
  onRevealHint: () => void;
}

export function HintsPanel({
  hints,
  hintsRevealed,
  onRevealHint,
}: HintsPanelProps) {
  return (
    <div className="mb-6 rounded-lg border border-warning/30 bg-warning/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-warning-dark">Hints</h3>
        {hintsRevealed < hints.length && (
          <button
            className="text-sm text-warning-dark hover:underline"
            onClick={onRevealHint}
            type="button"
          >
            Show hint ({hintsRevealed}/{hints.length})
          </button>
        )}
      </div>
      {hintsRevealed > 0 ? (
        <ul className="space-y-2 text-sm text-text-light">
          {hints.slice(0, hintsRevealed).map((hint) => (
            <li className="flex gap-2" key={hint}>
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
