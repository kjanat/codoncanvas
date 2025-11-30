import type { JSX } from "react";
import type { AssessmentDifficulty } from "@/education/assessments/assessment-engine";
import { DIFFICULTY_LABELS } from "./constants";

interface DifficultySelectorProps {
  difficulty: AssessmentDifficulty;
  onSelect: (d: AssessmentDifficulty) => void;
}

export function DifficultySelector({
  difficulty,
  onSelect,
}: DifficultySelectorProps): JSX.Element {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-text">
        Difficulty
      </span>
      <div className="flex gap-2">
        {(Object.keys(DIFFICULTY_LABELS) as AssessmentDifficulty[]).map((d) => (
          <button
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              difficulty === d
                ? "bg-primary text-white"
                : "bg-surface text-text hover:bg-primary/10"
            }`}
            key={d}
            onClick={() => onSelect(d)}
            type="button"
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>
    </div>
  );
}
