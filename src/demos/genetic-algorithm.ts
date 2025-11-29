import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
import { GeneticAlgorithm } from "@/genetics/genetic-algorithm";

// State
let ga: GeneticAlgorithm | null = null;
let running = false;
let animationId: Timer | null = null;

// Elements
const targetCanvas = document.getElementById(
  "target-canvas",
) as HTMLCanvasElement;
const bestCanvas = document.getElementById("best-canvas") as HTMLCanvasElement;
const chartCanvas = document.getElementById(
  "chart-canvas",
) as HTMLCanvasElement;
const populationGrid = document.getElementById(
  "population-grid",
) as HTMLDivElement;

const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
const pauseBtn = document.getElementById("pause-btn") as HTMLButtonElement;
const stepBtn = document.getElementById("step-btn") as HTMLButtonElement;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;

const fitnessGoalSelect = document.getElementById(
  "fitness-goal",
) as HTMLSelectElement;
const populationSizeSlider = document.getElementById(
  "population-size",
) as HTMLInputElement;
const mutationRateSlider = document.getElementById(
  "mutation-rate",
) as HTMLInputElement;
const crossoverRateSlider = document.getElementById(
  "crossover-rate",
) as HTMLInputElement;
const selectionStrategySelect = document.getElementById(
  "selection-strategy",
) as HTMLSelectElement;
const crossoverStrategySelect = document.getElementById(
  "crossover-strategy",
) as HTMLSelectElement;

// Update range displays
populationSizeSlider.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;
  const val = document.getElementById("population-size-value");
  if (val) val.textContent = target.value;
});

mutationRateSlider.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;
  const val = document.getElementById("mutation-rate-value");
  if (val) val.textContent = parseFloat(target.value).toFixed(2);
});

crossoverRateSlider.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;
  const val = document.getElementById("crossover-rate-value");
  if (val) val.textContent = parseFloat(target.value).toFixed(2);
});

type FitnessFunction = (genome: string, canvas: HTMLCanvasElement) => number;

// Fitness Functions
const fitnessFunctions: Record<string, FitnessFunction> = {
  "center-circle": (_genome, canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const imageData = ctx.getImageData(0, 0, 400, 400);
    const data = imageData.data;

    // Check for dark pixels in center circle (radius 100)
    let centerPixels = 0;
    let darkCenterPixels = 0;

    for (let y = 150; y < 250; y++) {
      for (let x = 150; x < 250; x++) {
        const dx = x - 200;
        const dy = y - 200;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          centerPixels++;
          const idx = (y * 400 + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r + g + b) / 3;

          if (brightness < 200) {
            darkCenterPixels++;
          }
        }
      }
    }

    return centerPixels > 0 ? darkCenterPixels / centerPixels : 0;
  },

  corners: (_genome, canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const imageData = ctx.getImageData(0, 0, 400, 400);
    const data = imageData.data;

    const corners = [
      { x: 50, y: 50 },
      { x: 350, y: 50 },
      { x: 50, y: 350 },
      { x: 350, y: 350 },
    ];

    const calculateCornerScore = (
      corner: { x: number; y: number },
      data: Uint8ClampedArray,
    ) => {
      let darkPixels = 0;
      let totalPixels = 0;

      const startY = Math.max(0, corner.y - 30);
      const endY = Math.min(400, corner.y + 30);
      const startX = Math.max(0, corner.x - 30);
      const endX = Math.min(400, corner.x + 30);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          totalPixels++;
          const idx = (y * 400 + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

          if (brightness < 200) {
            darkPixels++;
          }
        }
      }
      return totalPixels > 0 ? darkPixels / totalPixels : 0;
    };

    let totalScore = 0;
    corners.forEach((corner) => {
      totalScore += calculateCornerScore(corner, data);
    });

    return totalScore / 4;
  },

  symmetry: (_genome, canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const imageData = ctx.getImageData(0, 0, 400, 400);
    const data = imageData.data;

    let symmetryScore = 0;
    let totalPixels = 0;

    for (let y = 0; y < 400; y++) {
      for (let x = 0; x < 200; x++) {
        const leftIdx = (y * 400 + x) * 4;
        const rightIdx = (y * 400 + (399 - x)) * 4;

        const leftBrightness =
          (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
        const rightBrightness =
          (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

        const diff = Math.abs(leftBrightness - rightBrightness);
        symmetryScore += 1 - diff / 255;
        totalPixels++;
      }
    }

    return totalPixels > 0 ? symmetryScore / totalPixels : 0;
  },

  density: (_genome, canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const imageData = ctx.getImageData(0, 0, 400, 400);
    const data = imageData.data;

    let darkPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < 200) {
        darkPixels++;
      }
    }

    const totalPixels = 400 * 400;
    const density = darkPixels / totalPixels;

    // Target 30-50% density
    if (density < 0.3) {
      return density / 0.3;
    } else if (density > 0.5) {
      return 1 - (density - 0.5) / 0.5;
    } else {
      return 1.0;
    }
  },
};

// Draw target pattern
function drawTarget() {
  const goal = fitnessGoalSelect.value;
  const ctx = targetCanvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "black";

  switch (goal) {
    case "center-circle":
      ctx.beginPath();
      ctx.arc(200, 200, 100, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "corners":
      [50, 350].forEach((x) => {
        [50, 350].forEach((y) => {
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      break;

    case "symmetry":
      ctx.font = "20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Horizontal", 200, 190);
      ctx.fillText("Symmetry", 200, 220);
      break;

    case "density":
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Target:", 200, 180);
      ctx.fillText("30-50%", 200, 210);
      ctx.fillText("Pixel Density", 200, 240);
      break;
  }
}

// Render genome on canvas
function renderGenome(genome: string, canvas: HTMLCanvasElement) {
  try {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 400, 400);
    }

    const lexer = new CodonLexer();
    const tokens = lexer.tokenize(genome);
    const renderer = new Canvas2DRenderer(canvas);
    const vm = new CodonVM(renderer);
    vm.run(tokens);
  } catch (_error) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffcccc";
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = "#cc0000";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Invalid Genome", 200, 200);
    }
  }
}

// Draw fitness chart
function drawChart() {
  if (!ga) return;

  const stats = ga.getStats();
  if (stats.length === 0) return;

  const ctx = chartCanvas.getContext("2d");
  if (!ctx) return;

  const width = chartCanvas.width;
  const height = chartCanvas.height;

  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, width, height);

  const maxGen = Math.max(stats.length - 1, 1);
  const xScale = width / maxGen;
  const yScale = height;

  // Draw grid
  ctx.strokeStyle = "#3e3e42";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const y = height - (i * height) / 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw best fitness line
  ctx.strokeStyle = "#4ec9b0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  stats.forEach((stat, i) => {
    const x = i * xScale;
    const y = height - stat.bestFitness * yScale;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw avg fitness line
  ctx.strokeStyle = "#858585";
  ctx.lineWidth = 1;
  ctx.beginPath();
  stats.forEach((stat, i) => {
    const x = i * xScale;
    const y = height - stat.avgFitness * yScale;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Legend
  ctx.font = "10px monospace";
  ctx.fillStyle = "#4ec9b0";
  ctx.fillText("Best", 10, 15);
  ctx.fillStyle = "#858585";
  ctx.fillText("Avg", 50, 15);
}

// Update population grid
function updatePopulationGrid() {
  if (!ga) return;

  const population = ga.getPopulation().slice(0, 10);
  populationGrid.innerHTML = "";

  population.forEach((individual, index) => {
    const card = document.createElement("div");
    card.className = `individual-card${index === 0 ? " best" : ""}`;

    const label = document.createElement("div");
    label.className = "individual-label";
    label.textContent = `#${index + 1}`;

    const fitness = document.createElement("div");
    fitness.className = "individual-fitness";
    fitness.textContent = `Fitness: ${individual.fitness.toFixed(3)}`;

    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    card.appendChild(label);
    card.appendChild(fitness);
    card.appendChild(canvas);

    card.addEventListener("click", () => {
      renderGenome(individual.genome, bestCanvas);
      const label = document.getElementById("best-fitness-label");
      if (label) label.textContent = individual.fitness.toFixed(3);
    });

    populationGrid.appendChild(card);

    // Render on small canvas
    renderGenome(individual.genome, canvas);
  });
}

// Update stats
function updateStats() {
  if (!ga) return;

  const stats = ga.getStats();
  const lastStat = stats[stats.length - 1];

  const genStat = document.getElementById("generation-stat");
  if (genStat) genStat.textContent = ga.getGeneration().toString();

  const bestStat = document.getElementById("best-fitness-stat");
  if (bestStat) bestStat.textContent = lastStat.bestFitness.toFixed(3);

  const avgStat = document.getElementById("avg-fitness-stat");
  if (avgStat) avgStat.textContent = lastStat.avgFitness.toFixed(3);

  const divStat = document.getElementById("diversity-stat");
  if (divStat) divStat.textContent = `${Math.round(lastStat.diversity * 100)}%`;

  const best = ga.getBest();
  const bestLabel = document.getElementById("best-fitness-label");
  if (bestLabel) bestLabel.textContent = best.fitness.toFixed(3);
  renderGenome(best.genome, bestCanvas);

  drawChart();
  updatePopulationGrid();
}

// Initialize GA
function initGA() {
  const goal = fitnessGoalSelect.value;
  const fitnessFunc = fitnessFunctions[goal];

  // Simple seed genome
  const seedGenome = "ATG GAA AGG GGA TAA";

  ga = new GeneticAlgorithm([seedGenome], fitnessFunc, {
    populationSize: parseInt(populationSizeSlider.value, 10),
    mutationRate: parseFloat(mutationRateSlider.value),
    crossoverRate: parseFloat(crossoverRateSlider.value),
    selectionStrategy: selectionStrategySelect.value as
      | "tournament"
      | "roulette",
    crossoverStrategy: crossoverStrategySelect.value as
      | "single-point"
      | "uniform"
      | "none",
  });

  updateStats();
}

// Evolution loop
function evolve() {
  if (!running || !ga) return;

  ga.evolveGeneration();
  updateStats();

  animationId = setTimeout(evolve, 100);
}

// Event handlers
startBtn.addEventListener("click", () => {
  if (!ga) {
    initGA();
  }
  running = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  evolve();
});

pauseBtn.addEventListener("click", () => {
  running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  if (animationId) {
    clearTimeout(animationId);
    animationId = null;
  }
});

stepBtn.addEventListener("click", () => {
  if (!ga) {
    initGA();
  }
  if (ga) {
    ga.evolveGeneration();
    updateStats();
  }
});

resetBtn.addEventListener("click", () => {
  running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  if (animationId) {
    clearTimeout(animationId);
    animationId = null;
  }
  ga = null;

  const genStat = document.getElementById("generation-stat");
  if (genStat) genStat.textContent = "0";

  const bestStat = document.getElementById("best-fitness-stat");
  if (bestStat) bestStat.textContent = "0.00";

  const avgStat = document.getElementById("avg-fitness-stat");
  if (avgStat) avgStat.textContent = "0.00";

  const divStat = document.getElementById("diversity-stat");
  if (divStat) divStat.textContent = "100%";

  const bestLabel = document.getElementById("best-fitness-label");
  if (bestLabel) bestLabel.textContent = "0.00";

  const ctx = bestCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 400, 400);
  }

  populationGrid.innerHTML = "";

  const chartCtx = chartCanvas.getContext("2d");
  if (chartCtx) {
    chartCtx.fillStyle = "#1e1e1e";
    chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
  }
});

fitnessGoalSelect.addEventListener("change", () => {
  drawTarget();
});

// Initial draw
drawTarget();
