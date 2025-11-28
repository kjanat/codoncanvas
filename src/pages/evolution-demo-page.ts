import { AchievementEngine } from "../achievement-engine";
import { AchievementUI } from "../achievement-ui";
import "../achievement-ui.css";
import { escapeHtml, getElement } from "../dom-utils";
import { EvolutionEngine } from "../evolution-engine";
import { examples } from "../examples";
import { CodonLexer } from "../lexer";
import { Canvas2DRenderer } from "../renderer";
import { injectShareStyles, ShareSystem } from "../share-system";
import { evolutionTutorial, TutorialManager } from "../tutorial";
import { TutorialUI } from "../tutorial-ui";
import "../tutorial-ui.css";
import { CodonVM } from "../vm";

injectShareStyles();

interface Candidate {
  id: string;
  genome: string;
  mutation?: {
    type: string;
    description: string;
  };
}

const lexer = new CodonLexer();
let engine: EvolutionEngine | null = null;
let currentCandidates: Candidate[] = [];

// Initialize achievement system
const achievementEngine = new AchievementEngine();
const achievementUI = new AchievementUI(
  achievementEngine,
  "achievementContainer",
);

const statusContainer = getElement("statusContainer");
const startPanel = getElement("startPanel");
const evolutionPanel = getElement("evolutionPanel");
const lineagePanel = getElement("lineagePanel");
const sharePanel = getElement("sharePanel");
const candidatesGrid = getElement("candidatesGrid");
const lineageContainer = getElement("lineageContainer");
const shareContainer = getElement("shareContainer");
const generateBtn = getElement<HTMLButtonElement>("generateBtn");

// Initialize share system
new ShareSystem({
  containerElement: shareContainer,
  getGenome: () => engine?.getCurrentParent() ?? "",
  appTitle: "CodonCanvas Evolution Lab",
  showQRCode: true,
  socialPlatforms: ["twitter", "reddit", "email"],
});

function showStatus(message: string, type = "info"): void {
  statusContainer.innerHTML = `<div class="status ${escapeHtml(type)}">${escapeHtml(message)}</div>`;
  setTimeout(() => {
    statusContainer.innerHTML = "";
  }, 5000);
}

function renderGenome(genome: string, canvas: HTMLCanvasElement): boolean {
  try {
    const renderer = new Canvas2DRenderer(canvas);
    const vm = new CodonVM(renderer);
    renderer.clear();
    const tokens = lexer.tokenize(genome);
    vm.reset();
    vm.run(tokens);
    return true;
  } catch (error) {
    console.error("Render error:", error);
    return false;
  }
}

function updateStats(): void {
  if (!engine) return;
  const gen = engine.getCurrentGeneration();
  const history = engine.getHistory();
  const totalMutations = history.reduce(
    (sum: number, record: { candidates: unknown[] }) =>
      sum + record.candidates.length,
    0,
  );
  const lineage = engine.getLineage();

  const generationNumber = document.getElementById("generationNumber");
  const genStat = document.getElementById("genStat");
  const mutationStat = document.getElementById("mutationStat");
  const lineageStat = document.getElementById("lineageStat");

  if (generationNumber) generationNumber.textContent = String(gen);
  if (genStat) genStat.textContent = String(gen);
  if (mutationStat) mutationStat.textContent = String(totalMutations);
  if (lineageStat) lineageStat.textContent = String(lineage.length);
}

function updateLineage(): void {
  if (!engine) return;
  const lineage = engine.getLineage() as string[];
  lineageContainer.innerHTML = "";

  lineage.forEach((genome: string, index: number) => {
    if (index > 0) {
      const arrow = document.createElement("div");
      arrow.className = "lineage-arrow";
      arrow.textContent = "→";
      lineageContainer.appendChild(arrow);
    }

    const item = document.createElement("div");
    item.className = "lineage-item";

    const canvas = document.createElement("canvas");
    canvas.className = "lineage-canvas";
    canvas.width = 120;
    canvas.height = 120;
    renderGenome(genome, canvas);

    const label = document.createElement("div");
    label.className = "lineage-label";
    label.textContent = index === 0 ? "Original" : `Gen ${index}`;

    item.appendChild(canvas);
    item.appendChild(label);
    lineageContainer.appendChild(item);
  });

  lineagePanel.classList.remove("hidden");
}

function startEvolution(exampleKey: string): void {
  const example = examples[exampleKey as keyof typeof examples];
  if (!example) {
    showStatus("Example not found", "error");
    return;
  }

  engine = new EvolutionEngine(example.genome, {
    candidatesPerGeneration: 6,
    mutationTypes: ["point", "silent", "missense", "insertion", "deletion"],
  });

  startPanel.classList.add("hidden");
  evolutionPanel.classList.remove("hidden");
  sharePanel.classList.remove("hidden");

  updateStats();
  showStatus(`Evolution started with: ${example.title}`, "success");
}

function generateGeneration(): void {
  if (!engine) return;

  try {
    currentCandidates = engine.generateGeneration() as Candidate[];
    renderCandidates();
    generateBtn.disabled = true;
    updateStats();
    showStatus(
      `Generated ${currentCandidates.length} candidates - select the fittest!`,
      "info",
    );
  } catch (error) {
    showStatus(
      `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
  }
}

function renderCandidates(): void {
  candidatesGrid.innerHTML = "";

  currentCandidates.forEach((candidate: Candidate, index: number) => {
    const card = document.createElement("div");
    card.className = "candidate-card";
    card.onclick = () => selectCandidate(candidate.id);

    const header = document.createElement("div");
    header.className = "candidate-header";
    header.innerHTML = `<span>Candidate ${index + 1}</span><span>${candidate.id}</span>`;

    const canvas = document.createElement("canvas");
    canvas.className = "candidate-canvas";
    canvas.width = 250;
    canvas.height = 250;
    renderGenome(candidate.genome, canvas);

    const mutation = document.createElement("div");
    mutation.className = "candidate-mutation";
    if (candidate.mutation) {
      mutation.innerHTML = `<span class="mutation-type">${candidate.mutation.type}</span>: ${candidate.mutation.description}`;
    }

    card.appendChild(header);
    card.appendChild(canvas);
    card.appendChild(mutation);
    candidatesGrid.appendChild(card);
  });
}

function selectCandidate(candidateId: string): void {
  if (!engine) return;

  try {
    engine.selectCandidate(candidateId);

    // Track evolution generation for achievement
    const unlocked = achievementEngine.trackEvolutionGeneration();
    achievementUI.handleUnlocks(unlocked);

    // Visual feedback
    document.querySelectorAll(".candidate-card").forEach((card) => {
      card.classList.remove("selected");
      const lastSpan = card.querySelector(
        ".candidate-header span:last-child",
      ) as HTMLElement;
      if (lastSpan?.textContent === candidateId) {
        card.classList.add("selected");
      }
    });

    generateBtn.disabled = false;
    updateStats();
    updateLineage();
    showStatus(
      "✓ Candidate selected! Generate next generation to continue evolution.",
      "success",
    );
  } catch (error) {
    showStatus(
      `Selection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
  }
}

function resetEvolution(): void {
  if (confirm("Reset evolution and start over?")) {
    engine = null;
    currentCandidates = [];
    startPanel.classList.remove("hidden");
    evolutionPanel.classList.add("hidden");
    lineagePanel.classList.add("hidden");
    sharePanel.classList.add("hidden");
    candidatesGrid.innerHTML = "";
    lineageContainer.innerHTML = "";
    showStatus("Evolution reset", "info");
  }
}

// Expose functions to window
declare global {
  interface Window {
    startEvolution: (exampleKey: string) => void;
    generateGeneration: () => void;
    selectCandidate: (candidateId: string) => void;
    resetEvolution: () => void;
    resetEvolutionTutorial: () => void;
  }
}
window.startEvolution = startEvolution;
window.generateGeneration = generateGeneration;
window.selectCandidate = selectCandidate;
window.resetEvolution = resetEvolution;

// Load from URL if present
const urlGenome = ShareSystem.loadFromURL();
if (urlGenome) {
  engine = new EvolutionEngine(urlGenome);
  startPanel.classList.add("hidden");
  evolutionPanel.classList.remove("hidden");
  sharePanel.classList.remove("hidden");
  updateStats();
  showStatus("Loaded genome from share link", "success");
}

// Tutorial integration
const tutorialManager = new TutorialManager(
  "codoncanvas_evolution_tutorial_completed",
);
const tutorialUI = new TutorialUI(document.body, tutorialManager);

// Show tutorial on first visit
if (!tutorialManager.isCompleted()) {
  setTimeout(() => {
    tutorialManager.start(evolutionTutorial);
    tutorialUI.show();
  }, 2000); // 2 second delay for page to settle
}

// Tutorial callbacks
tutorialManager.onCompleteCallback(() => {
  console.log("Evolution tutorial completed! 🏆");
});

// Global function to reset tutorial (for testing)
window.resetEvolutionTutorial = () => {
  tutorialManager.reset();
  console.log("Evolution tutorial reset. Reload page to see it again.");
};
