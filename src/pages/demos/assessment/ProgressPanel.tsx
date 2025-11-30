import type { JSX } from "react";
import { Card } from "@/components/Card";
import type { AssessmentProgress } from "@/education/assessments/assessment-engine";

interface ProgressPanelProps {
  progress: AssessmentProgress;
  onReset: () => void;
}

export function ProgressPanel({
  progress,
  onReset,
}: ProgressPanelProps): JSX.Element {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-text">Progress</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Total Attempts:</span>
          <span className="font-medium text-text">
            {progress.totalAttempts}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Correct:</span>
          <span className="font-medium text-green-600">
            {progress.correctAnswers}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Accuracy:</span>
          <span className="font-medium text-primary">
            {progress.accuracy.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress.accuracy}%` }}
          />
        </div>
      </div>
      <button
        className="mt-4 w-full rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:bg-surface"
        onClick={onReset}
        type="button"
      >
        Reset Progress
      </button>
    </Card>
  );
}
