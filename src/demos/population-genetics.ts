import { CodonLexer } from "@/lexer";
import {
  applyDeletion,
  applyFrameshiftMutation,
  applyInsertion,
  applyPointMutation,
} from "@/mutations";
import { Canvas2DRenderer } from "@/renderer";
import { CodonVM } from "@/vm";

interface Organism {
  id: number;
  genome: string;
  generation: number;
  mutations: string[];
  parentId: number | null;
}

// Population state
let population: Organism[] = [];
let generation = 0;
let totalMutations = 0;
let isRunning = false;
let intervalId: Timer | null = null;
let founderGenome = "";

// DOM elements
const founderGenomeInput = document.getElementById(
  "founder-genome",
) as HTMLTextAreaElement;
const popSizeInput = document.getElementById("pop-size") as HTMLInputElement;
const mutationRateInput = document.getElementById(
  "mutation-rate",
) as HTMLInputElement;
const generationDelayInput = document.getElementById(
  "generation-delay",
) as HTMLInputElement;
const mutationTypeSelect = document.getElementById(
  "mutation-type",
) as HTMLSelectElement;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
const pauseBtn = document.getElementById("pause-btn") as HTMLButtonElement;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const stepBtn = document.getElementById("step-btn") as HTMLButtonElement;
const populationGrid = document.getElementById(
  "population-grid",
) as HTMLDivElement;
const currentGenSpan = document.getElementById(
  "current-gen",
) as HTMLSpanElement;
const totalMutationsSpan = document.getElementById(
  "total-mutations",
) as HTMLSpanElement;
const diversitySpan = document.getElementById("diversity") as HTMLSpanElement;
const uniqueGenomesSpan = document.getElementById(
  "unique-genomes",
) as HTMLSpanElement;
const generationDisplay = document.getElementById(
  "generation-display",
) as HTMLSpanElement;

// Initialize population
function initializePopulation() {
  const popSize = parseInt(popSizeInput.value, 10);
  founderGenome = founderGenomeInput.value.trim();

  population = Array.from({ length: popSize }, (_, i) => ({
    id: i,
    genome: founderGenome,
    generation: 0,
    mutations: [],
    parentId: null,
  }));

  generation = 0;
  totalMutations = 0;
  renderPopulation();
  updateStats();
}

// Apply mutation based on type distribution
function applyMutation(genome: string) {
  const mutationType = mutationTypeSelect.value;
  const rand = Math.random();

  let result: { mutated: string; description: string };
  switch (mutationType) {
    case "point-only":
      result = applyPointMutation(genome);
      break;
    case "frameshift-heavy":
      if (rand < 0.6) {
        result = applyFrameshiftMutation(genome);
      } else if (rand < 0.8) {
        result = applyInsertion(genome);
      } else {
        result = applyPointMutation(genome);
      }
      break;
    case "conservative":
      if (rand < 0.7) {
        // Silent mutation - pick a codon and replace with synonymous
        result = applyPointMutation(genome);
      } else if (rand < 0.9) {
        result = applyPointMutation(genome);
      } else {
        result = applyInsertion(genome);
      }
      break;
    default: // balanced
      if (rand < 0.5) {
        result = applyPointMutation(genome);
      } else if (rand < 0.7) {
        result = applyInsertion(genome);
      } else if (rand < 0.85) {
        result = applyDeletion(genome);
      } else {
        result = applyFrameshiftMutation(genome);
      }
  }

  return result;
}

// Advance one generation
function advanceGeneration() {
  generation++;
  const mutationRate = parseFloat(mutationRateInput.value) / 100;

  population = population.map((organism, _idx) => {
    let newGenome = organism.genome;
    const mutations = [];

    // Apply mutations based on rate
    if (Math.random() < mutationRate) {
      const mutationResult = applyMutation(newGenome);
      newGenome = mutationResult.mutated;
      mutations.push(mutationResult.description);
      totalMutations++;
    }

    return {
      id: organism.id,
      genome: newGenome,
      generation,
      mutations,
      parentId: organism.id,
    };
  });

  renderPopulation();
  updateStats();
}

// Render population grid
function renderPopulation() {
  populationGrid.innerHTML = "";
  generationDisplay.textContent = generation.toString();

  population.forEach((organism, idx) => {
    const card = document.createElement("div");
    card.className = "organism-card";

    const header = document.createElement("div");
    header.className = "organism-header";
    header.innerHTML = `
    <span>Organism ${idx + 1}</span>
    <span class="generation-badge">Gen ${organism.generation}</span>
  `;

    const canvas = document.createElement("canvas");
    canvas.className = "organism-canvas";
    canvas.width = 400;
    canvas.height = 400;

    const genomeDiv = document.createElement("div");
    genomeDiv.className = "organism-genome";

    // Highlight mutations if any - using DOM APIs to prevent XSS
    if (organism.mutations.length > 0) {
      const mutationSpan = document.createElement("span");
      mutationSpan.className = "mutation-highlight";
      mutationSpan.title = organism.mutations.join(", ");
      mutationSpan.textContent = organism.genome;
      genomeDiv.appendChild(mutationSpan);
    } else {
      genomeDiv.textContent = organism.genome;
    }

    card.appendChild(header);
    card.appendChild(canvas);
    card.appendChild(genomeDiv);
    populationGrid.appendChild(card);

    // Render genome on canvas
    try {
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize(organism.genome);
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      vm.run(tokens);
    } catch (error) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffebee";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#c62828";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Render Error", canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = "11px sans-serif";
        ctx.fillText(
          (error as Error).message.substring(0, 40),
          canvas.width / 2,
          canvas.height / 2 + 10,
        );
      }
    }
  });
}

// Update statistics
function updateStats() {
  currentGenSpan.textContent = generation.toString();
  totalMutationsSpan.textContent = totalMutations.toString();

  // Calculate genetic diversity (unique genomes / total)
  const uniqueGenomes = new Set(population.map((org) => org.genome)).size;
  const diversity = ((uniqueGenomes / population.length) * 100).toFixed(0);

  diversitySpan.textContent = `${diversity}%`;
  uniqueGenomesSpan.textContent = uniqueGenomes.toString();
}

// Event handlers
startBtn.addEventListener("click", () => {
  if (!isRunning) {
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stepBtn.disabled = true;

    const delay = parseInt(generationDelayInput.value, 10);
    intervalId = setInterval(advanceGeneration, delay);
  }
});

pauseBtn.addEventListener("click", () => {
  if (isRunning) {
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stepBtn.disabled = false;
    if (intervalId) clearInterval(intervalId);
  }
});

resetBtn.addEventListener("click", () => {
  if (isRunning) {
    if (intervalId) clearInterval(intervalId);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }
  stepBtn.disabled = false;
  initializePopulation();
});

stepBtn.addEventListener("click", () => {
  advanceGeneration();
});

// Initialize on load
initializePopulation();
