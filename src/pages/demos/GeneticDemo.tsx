import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { Label } from "@/components/Label";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { RangeSlider } from "@/components/RangeSlider";
import { Select } from "@/components/Select";
import { SimulationControls } from "@/components/SimulationControls";
import { applyPointMutation } from "@/genetics/mutations";
import { useLineChart } from "@/hooks/useLineChart";
import { useRenderGenome } from "@/hooks/useRenderGenome";
import { useSimulation } from "@/hooks/useSimulation";

type FitnessType = "coverage" | "symmetry" | "colorVariety" | "complexity";

const FITNESS_OPTIONS = [
  { value: "coverage" as const, label: "Canvas Coverage" },
  { value: "symmetry" as const, label: "Symmetry" },
  { value: "colorVariety" as const, label: "Color Variety" },
  { value: "complexity" as const, label: "Genome Complexity" },
];

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
    const r = Math.floor(data[i] / 32);
    const g = Math.floor(data[i + 1] / 32);
    const b = Math.floor(data[i + 2] / 32);
    colors.add(`${r},${g},${b}`);
  }

  return Math.min(colors.size / 50, 1);
}

function evaluateComplexity(genome: string): number {
  const codons = genome.replace(/\s+/g, "").match(/.{3}/g) || [];
  const uniqueCodons = new Set(codons);
  const lengthScore = Math.min(codons.length / 20, 1);
  const varietyScore = uniqueCodons.size / Math.max(codons.length, 1);
  return (lengthScore + varietyScore) / 2;
}

const DEFAULT_POPULATION_SIZE = 12;

function createInitialPopulation(size: number): Individual[] {
  return SEED_GENOMES.flatMap((g, seedIdx) =>
    Array.from({ length: Math.ceil(size / SEED_GENOMES.length) }, (_, i) => ({
      id: `gen0-${seedIdx}-${i}`,
      genome: g,
      fitness: 0,
      generation: 0,
    })),
  ).slice(0, size);
}

function tournamentSelect(evaluated: Individual[]): Individual {
  const a = evaluated[Math.floor(Math.random() * evaluated.length)];
  const b = evaluated[Math.floor(Math.random() * evaluated.length)];
  return a.fitness > b.fitness ? a : b;
}

function mutateGenome(genome: string, rate: number): string {
  if (Math.random() >= rate) return genome;
  try {
    return applyPointMutation(genome).mutated;
  } catch (error) {
    console.warn("Mutation failed, keeping parent genome:", error);
    return genome;
  }
}

function buildNextGeneration(
  evaluated: Individual[],
  currentGen: number,
  targetSize: number,
  mutationRate: number,
): Individual[] {
  const nextGen: Individual[] = [];
  const newGen = currentGen + 1;

  // Elitism: keep top performers
  const eliteCount = Math.min(2, evaluated.length);
  for (let i = 0; i < eliteCount; i++) {
    nextGen.push({
      ...evaluated[i],
      generation: newGen,
      id: `gen${newGen}-elite${i}`,
    });
  }

  // Fill rest with mutated offspring
  while (nextGen.length < targetSize) {
    const parent = tournamentSelect(evaluated);
    nextGen.push({
      id: `gen${newGen}-${nextGen.length}`,
      genome: mutateGenome(parent.genome, mutationRate),
      fitness: 0,
      generation: newGen,
    });
  }

  return nextGen;
}

export default function GeneticDemo() {
  const [fitnessType, setFitnessType] = useState<FitnessType>("coverage");
  const [populationSize, setPopulationSize] = useState(DEFAULT_POPULATION_SIZE);
  const [mutationRate, setMutationRate] = useState(0.3);
  const [state, setState] = useState<GAState>(() => ({
    generation: 0,
    population: createInitialPopulation(DEFAULT_POPULATION_SIZE),
    bestFitness: 0,
    avgFitness: 0,
    history: [],
  }));
  const [selectedIndividual, setSelectedIndividual] =
    useState<Individual | null>(null);

  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  const { render } = useRenderGenome();

  // Render genome to canvas with white background
  const renderGenome = useCallback(
    (genome: string, canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      render(genome, canvas);
    },
    [render],
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
      const evaluated = prev.population
        .map((ind) => ({ ...ind, fitness: evaluateFitness(ind.genome) }))
        .sort((a, b) => b.fitness - a.fitness);

      const bestFitness = evaluated[0]?.fitness ?? 0;
      const avgFitness =
        evaluated.reduce((s, i) => s + i.fitness, 0) / evaluated.length;

      const nextGen = buildNextGeneration(
        evaluated,
        prev.generation,
        populationSize,
        mutationRate,
      );

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

  // Use simulation hook
  const {
    state: simState,
    step,
    toggle,
    reset: resetSim,
  } = useSimulation({
    initialSpeed: 500,
    onStep: evolveGeneration,
  });

  // Render all individuals
  useEffect(() => {
    state.population.forEach((ind) => {
      const canvas = canvasRefs.current.get(ind.id);
      if (canvas) {
        renderGenome(ind.genome, canvas);
      }
    });
  }, [state.population, renderGenome]);

  // Build chart series from history
  const chartSeries = useMemo(
    () => [
      { data: state.history.map((h) => h.best), color: "#22c55e", width: 2 },
      { data: state.history.map((h) => h.avg), color: "#94a3b8", width: 1 },
    ],
    [state.history],
  );

  const chartRef = useLineChart({
    series: chartSeries,
    bgColor: "#f8fafc",
    gridColor: "#e2e8f0",
  });

  const handleReset = () => {
    resetSim();
    setState({
      generation: 0,
      population: createInitialPopulation(populationSize),
      bestFitness: 0,
      avgFitness: 0,
      history: [],
    });
    setSelectedIndividual(null);
  };

  return (
    <PageContainer>
      <PageHeader
        subtitle="Automated evolution with fitness functions"
        title="Genetic Algorithm"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Controls */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text">Parameters</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fitness-function">Fitness Function</Label>
              <Select
                className="w-full"
                disabled={simState.isRunning}
                id="fitness-function"
                onChange={setFitnessType}
                options={FITNESS_OPTIONS}
                value={fitnessType}
              />
            </div>

            <div>
              <Label htmlFor="ga-population">
                Population: {populationSize}
              </Label>
              <RangeSlider
                disabled={simState.isRunning}
                id="ga-population"
                max={24}
                min={6}
                onChange={setPopulationSize}
                step={2}
                value={populationSize}
              />
            </div>

            <div>
              <Label htmlFor="mutation-rate">
                Mutation Rate: {(mutationRate * 100).toFixed(0)}%
              </Label>
              <RangeSlider
                id="mutation-rate"
                max={0.8}
                min={0.05}
                onChange={setMutationRate}
                step={0.05}
                value={mutationRate}
              />
            </div>

            <SimulationControls
              isRunning={simState.isRunning}
              onReset={handleReset}
              onStep={step}
              onToggle={toggle}
              runLabel="Evolve"
            />
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
        </Card>

        {/* Population grid */}
        <Card className="lg:col-span-2">
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
        </Card>

        {/* Chart + selected */}
        <div className="space-y-6">
          <Card>
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
          </Card>

          {selectedIndividual && (
            <Card>
              <h2 className="mb-2 text-sm font-semibold text-text">
                Selected Genome
              </h2>
              <pre className="overflow-x-auto rounded bg-surface p-2 text-xs">
                {selectedIndividual.genome}
              </pre>
              <div className="mt-2 text-xs text-text-muted">
                Fitness: {(selectedIndividual.fitness * 100).toFixed(1)}%
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Educational content */}
      <Card className="mt-8">
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
      </Card>
    </PageContainer>
  );
}
