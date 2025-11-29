import { useCallback, useEffect, useRef, useState } from "react";

interface Allele {
  id: string;
  frequency: number;
  color: string;
}

interface PopulationState {
  generation: number;
  alleles: Allele[];
  history: { generation: number; frequencies: number[] }[];
}

const COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
];

function sampleWithReplacement(alleles: Allele[], popSize: number): Allele[] {
  // Create weighted array for sampling
  const total = alleles.reduce((sum, a) => sum + a.frequency, 0);
  const counts = alleles.map(() => 0);

  for (let i = 0; i < popSize; i++) {
    let r = Math.random() * total;
    for (let j = 0; j < alleles.length; j++) {
      r -= alleles[j].frequency;
      if (r <= 0) {
        counts[j]++;
        break;
      }
    }
  }

  // Convert counts back to frequencies
  return alleles.map((a, i) => ({
    ...a,
    frequency: counts[i] / popSize,
  }));
}

export default function PopulationDemo() {
  const [populationSize, setPopulationSize] = useState(100);
  const [numAlleles, setNumAlleles] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [population, setPopulation] = useState<PopulationState>({
    generation: 0,
    alleles: Array.from({ length: numAlleles }, (_, i) => ({
      id: `allele-${i}`,
      frequency: 1 / numAlleles,
      color: COLORS[i % COLORS.length],
    })),
    history: [
      { generation: 0, frequencies: Array(numAlleles).fill(1 / numAlleles) },
    ],
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  function initPopulation(count: number): PopulationState {
    const freq = 1 / count;
    return {
      generation: 0,
      alleles: Array.from({ length: count }, (_, i) => ({
        id: `allele-${i}`,
        frequency: freq,
        color: COLORS[i % COLORS.length],
      })),
      history: [{ generation: 0, frequencies: Array(count).fill(freq) }],
    };
  }

  const step = useCallback(() => {
    setPopulation((prev) => {
      // Check if simulation ended (only 1 allele left)
      const activeAlleles = prev.alleles.filter((a) => a.frequency > 0);
      if (activeAlleles.length <= 1) {
        setIsRunning(false);
        return prev;
      }

      const newAlleles = sampleWithReplacement(prev.alleles, populationSize);
      const newGen = prev.generation + 1;

      return {
        generation: newGen,
        alleles: newAlleles,
        history: [
          ...prev.history,
          {
            generation: newGen,
            frequencies: newAlleles.map((a) => a.frequency),
          },
        ],
      };
    });
  }, [populationSize]);

  // Auto-run simulation
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(step, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, speed, step]);

  // Draw frequency chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let y = 0; y <= 1; y += 0.25) {
      ctx.beginPath();
      ctx.moveTo(0, height * (1 - y));
      ctx.lineTo(width, height * (1 - y));
      ctx.stroke();
    }

    // Draw frequency lines
    const history = population.history;
    if (history.length < 2) return;

    const xScale = width / Math.max(history.length - 1, 1);

    population.alleles.forEach((allele, alleleIdx) => {
      ctx.strokeStyle = allele.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      history.forEach((h, i) => {
        const x = i * xScale;
        const y = height * (1 - h.frequencies[alleleIdx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    });
  }, [population]);

  const reset = () => {
    setIsRunning(false);
    setPopulation(initPopulation(numAlleles));
  };

  const handleAllelesChange = (n: number) => {
    setNumAlleles(n);
    setIsRunning(false);
    setPopulation(initPopulation(n));
  };

  // Check if fixation occurred
  const fixedAllele = population.alleles.find((a) => a.frequency >= 0.999);
  const lostAlleles = population.alleles.filter((a) => a.frequency < 0.001);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-text">
          Population Genetics
        </h1>
        <p className="text-text-muted">
          Observe genetic drift - random changes in allele frequencies over
          generations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">Parameters</h2>

          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-text"
                htmlFor="population-size"
              >
                Population Size: {populationSize}
              </label>
              <input
                className="w-full"
                disabled={isRunning}
                id="population-size"
                max="500"
                min="10"
                onChange={(e) => setPopulationSize(Number(e.target.value))}
                step="10"
                type="range"
                value={populationSize}
              />
              <p className="mt-1 text-xs text-text-muted">
                Smaller populations = faster drift
              </p>
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-text"
                htmlFor="num-alleles"
              >
                Number of Alleles: {numAlleles}
              </label>
              <input
                className="w-full"
                disabled={isRunning}
                id="num-alleles"
                max="5"
                min="2"
                onChange={(e) => handleAllelesChange(Number(e.target.value))}
                type="range"
                value={numAlleles}
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-text"
                htmlFor="simulation-speed"
              >
                Speed: {speed}ms
              </label>
              <input
                className="w-full"
                id="simulation-speed"
                max="500"
                min="50"
                onChange={(e) => setSpeed(Number(e.target.value))}
                step="50"
                type="range"
                value={speed}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark"
                onClick={() => setIsRunning(!isRunning)}
                type="button"
              >
                {isRunning ? "Pause" : "Run"}
              </button>
              <button
                className="rounded-lg border border-border px-4 py-2 text-text transition-colors hover:bg-surface disabled:opacity-50"
                disabled={isRunning}
                onClick={step}
                type="button"
              >
                Step
              </button>
              <button
                className="rounded-lg border border-border px-4 py-2 text-text transition-colors hover:bg-surface"
                onClick={reset}
                type="button"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Current frequencies */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-text">
              Generation {population.generation}
            </h3>
            <div className="space-y-2">
              {population.alleles.map((allele, i) => (
                <div className="flex items-center gap-2" key={allele.id}>
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: allele.color }}
                  />
                  <span className="text-sm text-text">
                    Allele {i + 1}: {(allele.frequency * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">
            Allele Frequency Over Time
          </h2>

          <div className="relative">
            <canvas
              className="w-full rounded-lg border border-border bg-surface"
              height={300}
              ref={canvasRef}
              width={600}
            />
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-2 text-xs text-text-muted">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
          </div>

          {/* Status messages */}
          {fixedAllele && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
              <strong>Fixation!</strong> Allele with{" "}
              <span
                className="inline-block h-3 w-3 rounded"
                style={{ backgroundColor: fixedAllele.color }}
              />{" "}
              reached 100% frequency at generation {population.generation}.
            </div>
          )}

          {lostAlleles.length > 0 && !fixedAllele && (
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-800">
              <strong>Allele Loss:</strong> {lostAlleles.length} allele(s)
              eliminated from the population.
            </div>
          )}
        </div>
      </div>

      {/* Educational content */}
      <div className="mt-8 rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text">
          About Genetic Drift
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-medium text-text">
              What is Genetic Drift?
            </h3>
            <p className="text-sm text-text-muted">
              Genetic drift is the random change in allele frequencies that
              occurs in every population due to chance sampling. Each
              generation, alleles are randomly "sampled" to form the next
              generation, leading to random fluctuations in frequency.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-text">Key Observations</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-text-muted">
              <li>Smaller populations drift faster</li>
              <li>Eventually one allele "fixes" at 100%</li>
              <li>Other alleles are lost (reach 0%)</li>
              <li>Drift is random - outcomes vary each run</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
