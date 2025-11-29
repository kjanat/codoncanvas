import { useCallback, useEffect, useRef, useState } from "react";
import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
import { applyPointMutation } from "@/genetics/mutations";

type FitnessType = "coverage" | "symmetry" | "colorVariety" | "complexity";

interface Individual {
  id: string;
  genome: string;
  fitness: number;
  generation: number;
}

interface GAState {
  generation: number;
  population: Individual[];
  bestFitness: number;
  avgFitness: number;
  history: { gen: number; best: number; avg: number }[];
}

const SEED_GENOMES = [
  "ATG GCA CCA GGA TAA",
  "ATG GCA AAA GGA CCC TAA",
  "ATG AAA GCA CCC GGA TAA",
];

// Fitness functions
function evaluateCoverage(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let nonWhitePixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) {
      nonWhitePixels++;
    }
  }

  return nonWhitePixels / (canvas.width * canvas.height);
}

function evaluateSymmetry(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  let matches = 0;
  let total = 0;

  // Check horizontal symmetry
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width / 2; x++) {
      const leftIdx = (y * width + x) * 4;
      const rightIdx = (y * width + (width - 1 - x)) * 4;

      const diff =
        Math.abs(data[leftIdx] - data[rightIdx]) +
        Math.abs(data[leftIdx + 1] - data[rightIdx + 1]) +
        Math.abs(data[leftIdx + 2] - data[rightIdx + 2]);

      if (diff < 30) matches++;
      total++;
    }
  }

  return matches / total;
}

function evaluateColorVariety(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colors = new Set<string>();

  for (let i = 0; i < data.length; i += 4) {
    // Quantize colors to reduce noise
    const r = Math.floor(data[i] / 32);
    const g = Math.floor(data[i + 1] / 32);
    const b = Math.floor(data[i + 2] / 32);
    colors.add(`${r},${g},${b}`);
  }

  // Normalize: expect up to ~50 distinct color buckets
  return Math.min(colors.size / 50, 1);
}

function evaluateComplexity(genome: string): number {
  // Measure genome complexity based on length and variety
  const codons = genome.replace(/\s+/g, "").match(/.{3}/g) || [];
  const uniqueCodons = new Set(codons);
  const lengthScore = Math.min(codons.length / 20, 1);
  const varietyScore = uniqueCodons.size / Math.max(codons.length, 1);
  return (lengthScore + varietyScore) / 2;
}

export default function GeneticDemo() {
  const [fitnessType, setFitnessType] = useState<FitnessType>("coverage");
  const [populationSize, setPopulationSize] = useState(12);
  const [mutationRate, setMutationRate] = useState(0.3);
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<GAState>(() => initState());
  const [selectedIndividual, setSelectedIndividual] =
    useState<Individual | null>(null);

  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const lexer = useRef(new CodonLexer());

  function initState(): GAState {
    const pop = SEED_GENOMES.flatMap((g, seedIdx) =>
      Array.from(
        { length: Math.ceil(populationSize / SEED_GENOMES.length) },
        (_, i) => ({
          id: `gen0-${seedIdx}-${i}`,
          genome: g,
          fitness: 0,
          generation: 0,
        }),
      ),
    ).slice(0, populationSize);

    return {
      generation: 0,
      population: pop,
      bestFitness: 0,
      avgFitness: 0,
      history: [],
    };
  }

  const renderGenome = useCallback(
    (genome: string, canvas: HTMLCanvasElement) => {
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
        // Invalid genome - leave canvas white
      }
    },
    [],
  );

  const evaluateFitness = useCallback(
    (genome: string): number => {
      if (!offscreenCanvas.current) {
        offscreenCanvas.current = document.createElement("canvas");
        offscreenCanvas.current.width = 100;
        offscreenCanvas.current.height = 100;
      }

      renderGenome(genome, offscreenCanvas.current);

      switch (fitnessType) {
        case "coverage":
          return evaluateCoverage(offscreenCanvas.current);
        case "symmetry":
          return evaluateSymmetry(offscreenCanvas.current);
        case "colorVariety":
          return evaluateColorVariety(offscreenCanvas.current);
        case "complexity":
          return evaluateComplexity(genome);
        default:
          return 0;
      }
    },
    [fitnessType, renderGenome],
  );

  const evolveGeneration = useCallback(() => {
    setState((prev) => {
      // Evaluate fitness
      const evaluated = prev.population.map((ind) => ({
        ...ind,
        fitness: evaluateFitness(ind.genome),
      }));

      // Sort by fitness
      evaluated.sort((a, b) => b.fitness - a.fitness);

      const bestFitness = evaluated[0]?.fitness ?? 0;
      const avgFitness =
        evaluated.reduce((s, i) => s + i.fitness, 0) / evaluated.length;

      // Selection: tournament
      const select = (): Individual => {
        const a = evaluated[Math.floor(Math.random() * evaluated.length)];
        const b = evaluated[Math.floor(Math.random() * evaluated.length)];
        return a.fitness > b.fitness ? a : b;
      };

      // Create next generation
      const nextGen: Individual[] = [];

      // Elitism: keep top 2
      nextGen.push(
        {
          ...evaluated[0],
          generation: prev.generation + 1,
          id: `gen${prev.generation + 1}-elite0`,
        },
        {
          ...evaluated[1],
          generation: prev.generation + 1,
          id: `gen${prev.generation + 1}-elite1`,
        },
      );

      // Fill rest with offspring
      while (nextGen.length < populationSize) {
        const parent = select();
        let childGenome = parent.genome;

        // Apply mutations
        if (Math.random() < mutationRate) {
          try {
            const result = applyPointMutation(childGenome);
            childGenome = result.mutated;
          } catch {
            // Keep original if mutation fails
          }
        }

        nextGen.push({
          id: `gen${prev.generation + 1}-${nextGen.length}`,
          genome: childGenome,
          fitness: 0,
          generation: prev.generation + 1,
        });
      }

      return {
        generation: prev.generation + 1,
        population: nextGen,
        bestFitness,
        avgFitness,
        history: [
          ...prev.history,
          { gen: prev.generation, best: bestFitness, avg: avgFitness },
        ],
      };
    });
  }, [evaluateFitness, mutationRate, populationSize]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(evolveGeneration, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, evolveGeneration]);

  // Render all individuals
  useEffect(() => {
    state.population.forEach((ind) => {
      const canvas = canvasRefs.current.get(ind.id);
      if (canvas) {
        renderGenome(ind.genome, canvas);
      }
    });
  }, [state.population, renderGenome]);

  // Draw fitness chart
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas || state.history.length < 1) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let y = 0; y <= 1; y += 0.25) {
      ctx.beginPath();
      ctx.moveTo(0, height * (1 - y));
      ctx.lineTo(width, height * (1 - y));
      ctx.stroke();
    }

    const history = state.history;
    const xScale = width / Math.max(history.length - 1, 1);

    // Draw average line
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    history.forEach((h, i) => {
      const x = i * xScale;
      const y = height * (1 - h.avg);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw best line
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((h, i) => {
      const x = i * xScale;
      const y = height * (1 - h.best);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [state.history]);

  const reset = () => {
    setIsRunning(false);
    setState(initState());
    setSelectedIndividual(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-text">Genetic Algorithm</h1>
        <p className="text-text-muted">
          Automated evolution with fitness functions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Controls */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">Parameters</h2>

          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-text"
                htmlFor="fitness-function"
              >
                Fitness Function
              </label>
              <select
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                disabled={isRunning}
                id="fitness-function"
                onChange={(e) => setFitnessType(e.target.value as FitnessType)}
                value={fitnessType}
              >
                <option value="coverage">Canvas Coverage</option>
                <option value="symmetry">Symmetry</option>
                <option value="colorVariety">Color Variety</option>
                <option value="complexity">Genome Complexity</option>
              </select>
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-text"
                htmlFor="ga-population"
              >
                Population: {populationSize}
              </label>
              <input
                className="w-full"
                disabled={isRunning}
                id="ga-population"
                max="24"
                min="6"
                onChange={(e) => setPopulationSize(Number(e.target.value))}
                step="2"
                type="range"
                value={populationSize}
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-text"
                htmlFor="mutation-rate"
              >
                Mutation Rate: {(mutationRate * 100).toFixed(0)}%
              </label>
              <input
                className="w-full"
                id="mutation-rate"
                max="0.8"
                min="0.05"
                onChange={(e) => setMutationRate(Number(e.target.value))}
                step="0.05"
                type="range"
                value={mutationRate}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark"
                onClick={() => setIsRunning(!isRunning)}
                type="button"
              >
                {isRunning ? "Pause" : "Evolve"}
              </button>
              <button
                className="rounded-lg border border-border px-4 py-2 text-text transition-colors hover:bg-surface disabled:opacity-50"
                disabled={isRunning}
                onClick={evolveGeneration}
                type="button"
              >
                Step
              </button>
            </div>

            <button
              className="w-full rounded-lg border border-border px-4 py-2 text-text transition-colors hover:bg-surface"
              onClick={reset}
              type="button"
            >
              Reset
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Generation:</span>
              <span className="font-medium text-text">{state.generation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Best Fitness:</span>
              <span className="font-medium text-green-600">
                {(state.bestFitness * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Avg Fitness:</span>
              <span className="font-medium text-text">
                {(state.avgFitness * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Population grid */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">Population</h2>

          <div className="grid grid-cols-4 gap-2">
            {state.population.map((ind, i) => (
              <button
                className={`relative rounded-lg border-2 p-1 transition-all ${
                  selectedIndividual?.id === ind.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                }`}
                key={ind.id}
                onClick={() => setSelectedIndividual(ind)}
                type="button"
              >
                <canvas
                  className="w-full rounded"
                  height={80}
                  ref={(el) => {
                    if (el) canvasRefs.current.set(ind.id, el);
                  }}
                  width={80}
                />
                {i < 2 && (
                  <span className="absolute right-1 top-1 rounded bg-yellow-400 px-1 text-xs font-bold">
                    E
                  </span>
                )}
                <div className="mt-1 text-xs text-text-muted">
                  {(ind.fitness * 100).toFixed(0)}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart + selected */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-text">
              Fitness Over Time
            </h2>
            <canvas
              className="w-full rounded border border-border"
              height={100}
              ref={chartRef}
              width={200}
            />
            <div className="mt-2 flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-4 rounded bg-green-500" /> Best
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-4 rounded bg-slate-400" /> Avg
              </span>
            </div>
          </div>

          {selectedIndividual && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-text">
                Selected Genome
              </h2>
              <pre className="overflow-x-auto rounded bg-surface p-2 text-xs">
                {selectedIndividual.genome}
              </pre>
              <div className="mt-2 text-xs text-text-muted">
                Fitness: {(selectedIndividual.fitness * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational content */}
      <div className="mt-8 rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text">
          About Genetic Algorithms
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-2 font-medium text-text">Selection</h3>
            <p className="text-sm text-text-muted">
              Tournament selection picks two random individuals and chooses the
              fitter one as a parent. This creates selection pressure toward
              better solutions.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-text">Mutation</h3>
            <p className="text-sm text-text-muted">
              Random point mutations introduce variation. Higher rates explore
              more but may lose good solutions. Lower rates refine existing
              solutions.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-text">Elitism</h3>
            <p className="text-sm text-text-muted">
              The top 2 individuals (marked "E") pass unchanged to the next
              generation. This prevents losing the best solutions found so far.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
