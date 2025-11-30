import { useState } from "react";
import { Link } from "react-router-dom";
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
}: LessonContentProps): React.JSX.Element {
  // Local state - resets automatically via key prop from parent
  const [code, setCode] = useState(lesson.starterCode);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(initialHintsRevealed);

  const handleRevealHint = (): void => {
    const newCount = hintsRevealed + 1;
    setHintsRevealed(newCount);
    onHintUsed(newCount);
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

  return (
    <div className="mx-auto max-w-4xl">
      <LessonHeader lesson={lesson} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div>
          <InstructionsPanel lesson={lesson} />
          <HintsPanel
            hints={lesson.hints}
            hintsRevealed={hintsRevealed}
            onRevealHint={handleRevealHint}
          />
          <LearningObjectives objectives={lesson.learningObjectives} />
        </div>

        {/* Right Column */}
        <div>
          <div className="mb-4 rounded-lg border border-border bg-white p-4">
            <h3 className="mb-3 font-semibold text-text">Your Code</h3>
            <CodeEditor
              code={code}
              onChange={setCode}
              onRun={handleRun}
              validation={validation}
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-border bg-white p-4">
            <h3 className="mb-3 font-semibold text-text">Preview</h3>
            <div className="flex justify-center rounded-lg bg-dark-bg p-4">
              <CanvasPreview
                className="rounded-md"
                genome={code}
                height={250}
                width={250}
              />
            </div>
          </div>

          {/* Navigation */}
          {validation?.passed && (
            <div className="mt-4 flex justify-end gap-4">
              {lesson.nextLesson ? (
                <button
                  className="rounded-lg bg-success px-6 py-2 font-medium text-white transition-colors hover:bg-success-dark"
                  onClick={onNextLesson}
                  type="button"
                >
                  Next Lesson -&gt;
                </button>
              ) : (
                <Link
                  className="rounded-lg bg-success px-6 py-2 font-medium text-white transition-colors hover:bg-success-dark"
                  to="/"
                >
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
