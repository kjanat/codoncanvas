import { useCallback, useEffect, useRef, useState } from "react";
import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
import {
  type AssessmentDifficulty,
  AssessmentEngine,
  type AssessmentProgress,
  type AssessmentResult,
  type Challenge,
} from "@/education/assessments/assessment-engine";
import type { MutationType } from "@/types";

// --- Constants ---

const MUTATION_TYPES: {
  value: MutationType;
  label: string;
  description: string;
}[] = [
  {
    value: "silent",
    label: "Silent",
    description: "Codon changes but opcode stays same",
  },
  {
    value: "missense",
    label: "Missense",
    description: "Codon changes to different opcode",
  },
  {
    value: "nonsense",
    label: "Nonsense",
    description: "Introduces premature STOP codon",
  },
  {
    value: "frameshift",
    label: "Frameshift",
    description: "Shifts reading frame (not divisible by 3)",
  },
  {
    value: "insertion",
    label: "Insertion",
    description: "Adds bases (divisible by 3)",
  },
  {
    value: "deletion",
    label: "Deletion",
    description: "Removes bases (divisible by 3)",
  },
];

const DIFFICULTY_LABELS: Record<AssessmentDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

// --- Helper Functions ---

function getAvailableTypes(difficulty: AssessmentDifficulty) {
  if (difficulty === "easy") {
    return MUTATION_TYPES.filter((t) =>
      ["silent", "missense"].includes(t.value),
    );
  }
  if (difficulty === "medium") {
    return MUTATION_TYPES.filter((t) =>
      ["silent", "missense", "nonsense"].includes(t.value),
    );
  }
  return MUTATION_TYPES;
}

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
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
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
    </div>
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
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
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
    </div>
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
  availableTypes: typeof MUTATION_TYPES;
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
        {availableTypes.map((type) => (
          <button
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedAnswer === type.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            key={type.value}
            onClick={() => onSelect(type.value)}
            type="button"
          >
            <div className="font-medium text-text">{type.label}</div>
            <div className="mt-1 text-xs text-text-muted">
              {type.description}
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
    <div className="mt-8 rounded-xl border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-text">
        Mutation Types Reference
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MUTATION_TYPES.map((type) => (
          <div className="rounded-lg bg-surface p-4" key={type.value}>
            <h3 className="font-medium text-text">{type.label}</h3>
            <p className="mt-1 text-sm text-text-muted">{type.description}</p>
          </div>
        ))}
      </div>
    </div>
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
  const lexer = useRef(new CodonLexer());

  const renderGenome = useCallback(
    (genome: string, canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      try {
        const tokens = lexer.current.tokenize(genome);
        const renderer = new Canvas2DRenderer(canvas);
        const vm = new CodonVM(renderer);
        vm.run(tokens);
      } catch {
        ctx.fillStyle = "#fee2e2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#dc2626";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Parse Error", canvas.width / 2, canvas.height / 2);
      }
    },
    [],
  );

  const generateNewChallenge = useCallback(() => {
    const newChallenge = engine.generateChallenge(difficulty);
    setChallenge(newChallenge);
    setSelectedAnswer(null);
    setResult(null);
    setShowHint(false);
  }, [engine, difficulty]);

  useEffect(() => {
    if (!challenge) return;
    renderGenome(challenge.original, originalCanvasRef.current);
    renderGenome(challenge.mutated, mutatedCanvasRef.current);
  }, [challenge, renderGenome]);

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

  const availableTypes = getAvailableTypes(difficulty);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-text">Assessment Mode</h1>
        <p className="text-text-muted">
          Test your understanding with mutation identification challenges
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
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
          </div>

          {progress && (
            <ProgressPanel onReset={resetProgress} progress={progress} />
          )}
        </div>

        {/* Challenge area */}
        <div className="lg:col-span-3 space-y-6">
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

              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
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
              </div>
            </>
          )}
        </div>
      </div>

      <MutationReference />
    </div>
  );
}
