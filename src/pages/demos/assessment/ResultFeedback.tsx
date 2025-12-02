import type { AssessmentResult } from "@/education/assessments/assessment-engine";

interface ResultFeedbackProps {
  result: AssessmentResult;
  onNext: () => void;
}

export function ResultFeedback({ result, onNext }: ResultFeedbackProps) {
  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg p-4 ${
          result.correct
            ? "bg-green-50 text-green-800"
            : "bg-red-50 text-red-800"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{result.correct ? "+" : "-"}</span>
          <span className="font-bold">
            {result.correct ? "Correct!" : "Incorrect"}
          </span>
        </div>
        <p className="mt-2">{result.feedback}</p>
      </div>
      <button
        className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        onClick={onNext}
        type="button"
      >
        Next Challenge
      </button>
    </div>
  );
}
