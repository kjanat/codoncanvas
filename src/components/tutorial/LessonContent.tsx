import { Link } from "@tanstack/react-router";
import { type ReactElement, useState } from "react";
import { CanvasPreview } from "@/components/CanvasPreview";
import type { TutorialLesson } from "@/data/tutorial-lessons";
import { CodeEditor } from "./CodeEditor";
import { HintsPanel } from "./HintsPanel";
import { InstructionsPanel } from "./InstructionsPanel";
import { LearningObjectives } from "./LearningObjectives";
import { LessonHeader } from "./LessonHeader";
import type { ValidationResult } from "./types";
import { validateCode } from "./validation";

interface LessonContentProps {
  lesson: TutorialLesson;
  initialHintsRevealed: number;
  onComplete: () => void;
  onHintUsed: (count: number) => void;
  onNextLesson: () => void;
}

/**
 * Self-contained lesson content component.
 * Uses key-based reset pattern - parent renders with key={lesson.id}
 * to automatically reset all internal state when lesson changes.
 */
export function LessonContent({
  lesson,
  initialHintsRevealed,
  onComplete,
  onHintUsed,
  onNextLesson,
}: LessonContentProps): ReactElement {
  // Local state - resets automatically via key prop from parent
  const [code, setCode] = useState(lesson.starterCode);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(initialHintsRevealed);

  const handleRevealHint = (): void => {
    setHintsRevealed((prev) => {
      const max = lesson.hints.length;
      if (prev >= max) {
        return prev; // No-op: already at max
      }
      const newCount = prev + 1;
      onHintUsed(newCount);
      return newCount;
    });
  };

  const handleRun = (): void => {
    try {
      const result = validateCode(lesson, code);
      setValidation(result);

      if (result.passed) {
        onComplete();
      }
    } catch (err) {
      console.error("Validation error:", err);
      setValidation({
        passed: false,
        errors: ["An unexpected error occurred while validating your code."],
      });
    }
  };

  const actionButtonClass =
    "min-h-11 rounded-lg bg-success px-6 py-2 font-medium text-white transition-colors hover:bg-success-dark";

  return (
    <div className="mx-auto max-w-4xl">
      <LessonHeader lesson={lesson} />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Left Column - Instructions */}
        <div className="space-y-4">
          <InstructionsPanel lesson={lesson} />
          <HintsPanel
            hints={lesson.hints}
            hintsRevealed={hintsRevealed}
            onRevealHint={handleRevealHint}
          />
          <LearningObjectives objectives={lesson.learningObjectives} />
        </div>

        {/* Right Column - Code & Preview */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-3 md:p-4">
            <h3 className="mb-3 font-semibold text-text">Your Code</h3>
            <CodeEditor
              code={code}
              onChange={setCode}
              onRun={handleRun}
              validation={validation}
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-border bg-surface p-3 md:p-4">
            <h3 className="mb-3 font-semibold text-text">Preview</h3>
            <div className="flex justify-center rounded-lg bg-surface-alt p-2 md:p-4">
              <CanvasPreview
                className="max-w-full rounded-md"
                data-testid="lesson-preview-canvas"
                genome={code}
                height={250}
                width={250}
              />
            </div>
          </div>

          {/* Navigation */}
          {validation?.passed && (
            <div className="flex justify-end gap-4">
              {lesson.nextLesson ? (
                <button
                  className={actionButtonClass}
                  onClick={onNextLesson}
                  type="button"
                >
                  Next Lesson -&gt;
                </button>
              ) : (
                <Link className={actionButtonClass} to="/">
                  Start Coding!
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
