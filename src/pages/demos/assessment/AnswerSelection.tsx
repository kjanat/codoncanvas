import type { MutationTypeInfo } from "@/data/mutation-types";
import type { MutationType } from "@/types";

interface AnswerSelectionProps {
  availableTypes: MutationTypeInfo[];
  selectedAnswer: MutationType | null;
  onSelect: (value: MutationType) => void;
  onSubmit: () => void;
  hint?: string;
  showHint: boolean;
  onToggleHint: () => void;
}

export function AnswerSelection({
  availableTypes,
  selectedAnswer,
  onSelect,
  onSubmit,
  hint,
  showHint,
  onToggleHint,
}: AnswerSelectionProps) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {availableTypes.map((typeInfo) => (
          <button
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedAnswer === typeInfo.type
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            key={typeInfo.type}
            onClick={() => onSelect(typeInfo.type)}
            type="button"
          >
            <div className="font-medium text-text">{typeInfo.label}</div>
            <div className="mt-1 text-xs text-text-muted">
              {typeInfo.description}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        {hint && (
          <button
            className="text-sm text-primary hover:underline"
            onClick={onToggleHint}
            type="button"
          >
            {showHint ? "Hide Hint" : "Show Hint"}
          </button>
        )}
        <button
          className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedAnswer}
          onClick={onSubmit}
          type="button"
        >
          Submit Answer
        </button>
      </div>

      {showHint && hint && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <strong>Hint:</strong> {hint}
        </div>
      )}
    </>
  );
}
