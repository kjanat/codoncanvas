import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import {
  getMutationTypesByDifficulty,
  MUTATION_TYPES,
  type MutationTypeInfo,
} from "@/data/mutation-types";
import {
  type AssessmentDifficulty,
  AssessmentEngine,
  type AssessmentProgress,
  type AssessmentResult,
  type Challenge,
} from "@/education/assessments/assessment-engine";
import { useRenderGenome } from "@/hooks/useRenderGenome";
import type { MutationType } from "@/types";

// --- Constants ---

const DIFFICULTY_LABELS: Record<AssessmentDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

// --- Sub-Components ---

function DifficultySelector({
  difficulty,
  onSelect,
}: {
  difficulty: AssessmentDifficulty;
  onSelect: (d: AssessmentDifficulty) => void;
}) {
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

function ProgressPanel({
  progress,
  onReset,
}: {
  progress: AssessmentProgress;
  onReset: () => void;
}) {
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

function GenomeCanvas({
  title,
  genome,
  canvasRef,
}: {
  title: string;
  genome: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  return (
    <Card>
      <h3 className="mb-4 text-center font-semibold text-text">{title}</h3>
      <canvas
        className="mx-auto block rounded-lg border border-border"
        height={200}
        ref={canvasRef}
        width={200}
      />
      <pre className="mt-4 overflow-x-auto rounded bg-surface p-2 text-xs">
        {genome}
      </pre>
    </Card>
  );
}

function AnswerSelection({
  availableTypes,
  selectedAnswer,
  onSelect,
  onSubmit,
  hint,
  showHint,
  onToggleHint,
}: {
  availableTypes: MutationTypeInfo[];
  selectedAnswer: MutationType | null;
  onSelect: (value: MutationType) => void;
  onSubmit: () => void;
  hint?: string;
  showHint: boolean;
  onToggleHint: () => void;
}) {
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

function ResultFeedback({
  result,
  onNext,
}: {
  result: AssessmentResult;
  onNext: () => void;
}) {
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

function MutationReference() {
  return (
    <Card className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-text">
        Mutation Types Reference
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MUTATION_TYPES.map((typeInfo) => (
          <div className="rounded-lg bg-surface p-4" key={typeInfo.type}>
            <h3 className="font-medium text-text">{typeInfo.label}</h3>
            <p className="mt-1 text-sm text-text-muted">
              {typeInfo.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- Main Component ---

export default function AssessmentDemo() {
  const [engine] = useState(() => new AssessmentEngine());
  const [difficulty, setDifficulty] = useState<AssessmentDifficulty>("easy");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<MutationType | null>(
    null,
  );
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);
  const [showHint, setShowHint] = useState(false);

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const mutatedCanvasRef = useRef<HTMLCanvasElement>(null);
  const { render } = useRenderGenome();

  const generateNewChallenge = useCallback(() => {
    const newChallenge = engine.generateChallenge(difficulty);
    setChallenge(newChallenge);
    setSelectedAnswer(null);
    setResult(null);
    setShowHint(false);
  }, [engine, difficulty]);

  useEffect(() => {
    if (!challenge) return;
    render(challenge.original, originalCanvasRef.current);
    render(challenge.mutated, mutatedCanvasRef.current);
  }, [challenge, render]);

  useEffect(() => {
    if (results.length > 0) {
      setProgress(engine.calculateProgress(results));
    }
  }, [engine, results]);

  const submitAnswer = () => {
    if (!challenge || !selectedAnswer) return;
    const assessmentResult = engine.scoreResponse(challenge, selectedAnswer);
    setResult(assessmentResult);
    setResults((prev) => [...prev, assessmentResult]);
  };

  const resetProgress = () => {
    setResults([]);
    setProgress(null);
    setChallenge(null);
    setResult(null);
  };

  const availableTypes = getMutationTypesByDifficulty(difficulty);

  return (
    <PageContainer>
      <PageHeader
        subtitle="Test your understanding with mutation identification challenges"
        title="Assessment Mode"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings sidebar */}
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-text">Settings</h2>
            <div className="space-y-4">
              <DifficultySelector
                difficulty={difficulty}
                onSelect={setDifficulty}
              />
              <button
                className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
                onClick={generateNewChallenge}
                type="button"
              >
                {challenge ? "New Challenge" : "Start Challenge"}
              </button>
            </div>
          </Card>

          {progress && (
            <ProgressPanel onReset={resetProgress} progress={progress} />
          )}
        </div>

        {/* Challenge area */}
        <div className="space-y-6 lg:col-span-3">
          {!challenge ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-white shadow-sm">
              <div className="text-center">
                <p className="text-lg text-text-muted">
                  Click "Start Challenge" to begin
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Identify mutation types by comparing genome outputs
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <GenomeCanvas
                  canvasRef={originalCanvasRef}
                  genome={challenge.original}
                  title="Original"
                />
                <GenomeCanvas
                  canvasRef={mutatedCanvasRef}
                  genome={challenge.mutated}
                  title="Mutated"
                />
              </div>

              <Card>
                <h3 className="mb-4 font-semibold text-text">
                  What type of mutation occurred?
                </h3>
                {!result ? (
                  <AnswerSelection
                    availableTypes={availableTypes}
                    hint={challenge.hint}
                    onSelect={setSelectedAnswer}
                    onSubmit={submitAnswer}
                    onToggleHint={() => setShowHint(!showHint)}
                    selectedAnswer={selectedAnswer}
                    showHint={showHint}
                  />
                ) : (
                  <ResultFeedback
                    onNext={generateNewChallenge}
                    result={result}
                  />
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      <MutationReference />
    </PageContainer>
  );
}
