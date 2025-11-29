import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CanvasPreview } from "@/components/CanvasPreview";
import { ProgressBar } from "@/components/ProgressBar";
import { CodonLexer } from "@/core/lexer";
import {
  getLessonById,
  getLessonsByModule,
  moduleNames,
  type TutorialLesson,
  tutorialLessons,
} from "@/data/tutorial-lessons";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// --- Types ---

interface TutorialProgress {
  completedLessons: string[];
  currentLesson: string;
  hintsUsed: Record<string, number>;
}

interface ValidationResult {
  passed: boolean;
  errors: string[];
}

// --- Validation Logic ---

function validateCode(lesson: TutorialLesson, code: string): ValidationResult {
  const errors: string[] = [];

  try {
    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(code);

    // Check required codons
    if (lesson.validation.requiredCodons) {
      const codeUpper = code.toUpperCase();
      for (const required of lesson.validation.requiredCodons) {
        if (!codeUpper.includes(required)) {
          errors.push(`Missing required codon: ${required}`);
        }
      }
    }

    // Check minimum instructions
    if (
      lesson.validation.minInstructions &&
      tokens.length < lesson.validation.minInstructions
    ) {
      errors.push(
        `Need at least ${lesson.validation.minInstructions} instructions (you have ${tokens.length})`,
      );
    }

    // Custom validator
    if (lesson.validation.customValidator) {
      if (!lesson.validation.customValidator(code)) {
        errors.push("Does not meet the lesson requirements");
      }
    }
  } catch (error) {
    errors.push(
      `Parse error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return { passed: errors.length === 0, errors };
}

// --- Sub-Components ---

function ModuleSidebar({
  currentLessonId,
  completedLessons,
  onSelectLesson,
}: {
  currentLessonId: string;
  completedLessons: string[];
  onSelectLesson: (id: string) => void;
}) {
  const modules = [1, 2, 3];

  return (
    <div className="w-64 shrink-0 overflow-auto border-r border-border bg-white p-4">
      <h2 className="mb-4 text-lg font-bold text-text">Lessons</h2>
      {modules.map((moduleNum) => (
        <div className="mb-4" key={moduleNum}>
          <h3 className="mb-2 text-sm font-semibold text-text-muted">
            Module {moduleNum}: {moduleNames[moduleNum]}
          </h3>
          <div className="space-y-1">
            {getLessonsByModule(moduleNum).map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isCurrent = lesson.id === currentLessonId;
              return (
                <button
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isCurrent
                      ? "bg-primary text-white"
                      : isCompleted
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : "text-text hover:bg-bg-light"
                  }`}
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson.id)}
                  type="button"
                >
                  <span className="mr-2">
                    {isCompleted ? "✓" : `${lesson.lessonNumber}.`}
                  </span>
                  {lesson.title}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LessonHeader({ lesson }: { lesson: TutorialLesson }) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="mb-1 text-sm text-text-muted">
        Module {lesson.module} - Lesson {lesson.lessonNumber}
      </div>
      <h1 className="mb-2 text-2xl font-bold text-text">{lesson.title}</h1>
      <p className="text-text-light">{lesson.description}</p>
    </div>
  );
}

function InstructionsPanel({ lesson }: { lesson: TutorialLesson }) {
  return (
    <div className="mb-6 rounded-lg border border-border bg-bg-light p-4">
      <h3 className="mb-3 font-semibold text-text">Instructions</h3>
      <ol className="list-inside list-decimal space-y-2 text-sm text-text-light">
        {lesson.instructions.map((instruction) => (
          <li key={instruction}>{instruction}</li>
        ))}
      </ol>
    </div>
  );
}

function HintsPanel({
  hints,
  hintsRevealed,
  onRevealHint,
}: {
  hints: string[];
  hintsRevealed: number;
  onRevealHint: () => void;
}) {
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
              <span className="text-warning">💡</span>
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

function CodeEditor({
  code,
  onChange,
  validation,
  onRun,
}: {
  code: string;
  onChange: (code: string) => void;
  validation: ValidationResult | null;
  onRun: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <textarea
          className="h-48 w-full rounded-lg border border-border bg-dark-bg p-4 font-mono text-sm text-dark-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your genome code here..."
          spellCheck={false}
          value={code}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary-dark"
          onClick={onRun}
          type="button"
        >
          Run & Validate
        </button>

        {validation && (
          <div
            className={`text-sm ${validation.passed ? "text-success" : "text-danger"}`}
          >
            {validation.passed
              ? "✓ Passed!"
              : `✗ ${validation.errors.length} issue(s)`}
          </div>
        )}
      </div>

      {validation && !validation.passed && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
          <ul className="space-y-1 text-sm text-danger">
            {validation.errors.map((error) => (
              <li key={error}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LearningObjectives({ objectives }: { objectives: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-3 font-semibold text-text">Learning Objectives</h3>
      <ul className="space-y-1 text-sm text-text-light">
        {objectives.map((obj) => (
          <li className="flex gap-2" key={obj}>
            <span className="text-primary">→</span>
            {obj}
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Main Component ---

export default function Tutorial() {
  const [progress, setProgress] = useLocalStorage<TutorialProgress>(
    "codoncanvas-tutorial-progress",
    {
      completedLessons: [],
      currentLesson: "basics-1",
      hintsUsed: {},
    },
  );

  const [code, setCode] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  const currentLesson = useMemo(
    () => getLessonById(progress.currentLesson) || tutorialLessons[0],
    [progress.currentLesson],
  );

  // Reset state when lesson changes
  useEffect(() => {
    setCode(currentLesson.starterCode);
    setValidation(null);
    setHintsRevealed(progress.hintsUsed[currentLesson.id] || 0);
  }, [currentLesson, progress.hintsUsed]);

  const handleSelectLesson = useCallback(
    (id: string) => {
      setProgress((prev) => ({ ...prev, currentLesson: id }));
    },
    [setProgress],
  );

  const handleRevealHint = useCallback(() => {
    const newCount = hintsRevealed + 1;
    setHintsRevealed(newCount);
    setProgress((prev) => ({
      ...prev,
      hintsUsed: { ...prev.hintsUsed, [currentLesson.id]: newCount },
    }));
  }, [hintsRevealed, currentLesson.id, setProgress]);

  const handleRun = useCallback(() => {
    const result = validateCode(currentLesson, code);
    setValidation(result);

    if (
      result.passed &&
      !progress.completedLessons.includes(currentLesson.id)
    ) {
      setProgress((prev) => ({
        ...prev,
        completedLessons: [...prev.completedLessons, currentLesson.id],
      }));
    }
  }, [currentLesson, code, progress.completedLessons, setProgress]);

  const handleNextLesson = useCallback(() => {
    if (currentLesson.nextLesson) {
      handleSelectLesson(currentLesson.nextLesson);
    }
  }, [currentLesson.nextLesson, handleSelectLesson]);

  const progressPercent = Math.round(
    (progress.completedLessons.length / tutorialLessons.length) * 100,
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-bg">
      {/* Sidebar */}
      <ModuleSidebar
        completedLessons={progress.completedLessons}
        currentLessonId={progress.currentLesson}
        onSelectLesson={handleSelectLesson}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-text-muted">
            <span>Overall Progress</span>
            <span>
              {progress.completedLessons.length}/{tutorialLessons.length}{" "}
              lessons ({progressPercent}%)
            </span>
          </div>
          <ProgressBar value={progressPercent} variant="gradient" />
        </div>

        <div className="mx-auto max-w-4xl">
          <LessonHeader lesson={currentLesson} />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div>
              <InstructionsPanel lesson={currentLesson} />
              <HintsPanel
                hints={currentLesson.hints}
                hintsRevealed={hintsRevealed}
                onRevealHint={handleRevealHint}
              />
              <LearningObjectives
                objectives={currentLesson.learningObjectives}
              />
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
                  {currentLesson.nextLesson ? (
                    <button
                      className="rounded-lg bg-success px-6 py-2 font-medium text-white transition-colors hover:bg-success-dark"
                      onClick={handleNextLesson}
                      type="button"
                    >
                      Next Lesson →
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
      </div>
    </div>
  );
}
