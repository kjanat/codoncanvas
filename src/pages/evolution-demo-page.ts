import { AchievementEngine } from "@/education/achievements/achievement-engine";
import { AchievementUI } from "@/education/achievements/achievement-ui";
import "@/achievement-ui.css";
import { examples } from "@/data/examples";
import { renderGenomeToCanvas } from "@/demos/demos-core";
import {
  evolutionTutorial,
  TutorialManager,
} from "@/education/tutorials/tutorial";
import { TutorialUI } from "@/education/tutorials/tutorial-ui";
import { EvolutionEngine } from "@/genetics/evolution-engine";
import { injectShareStyles, ShareSystem } from "@/ui/share-system";
import {
  getElementUnsafe as getElement,
  showStatus as showStatusBase,
} from "@/utils/dom";
import "@/tutorial-ui.css";

injectShareStyles();

interface Candidate {
  id: string;
  genome: string;
  mutation?: {
    type: string;
    description: string;
  };
}

let engine: EvolutionEngine | null = null;
let currentCandidates: Candidate[] = [];

// Initialize achievement system
const achievementEngine = new AchievementEngine();
const achievementUI = new AchievementUI(
  achievementEngine,
  "achievement-container",
);

const statusContainer = getElement("status-container");
const startPanel = getElement("start-panel");
const evolutionPanel = getElement("evolution-panel");
const lineagePanel = getElement("lineage-panel");
const sharePanel = getElement("share-panel");
const candidatesGrid = getElement("candidates-grid");
const lineageContainer = getElement("lineage-container");
const shareContainer = getElement("share-container");
const generateBtn = getElement<HTMLButtonElement>("generate-btn");
const resetBtn = getElement<HTMLButtonElement>("reset-btn");

// Initialize share system
new ShareSystem({
  containerElement: shareContainer,
  getGenome: () => engine?.getCurrentParent() ?? "",
  appTitle: "CodonCanvas Evolution Lab",
  showQRCode: true,
  socialPlatforms: ["twitter", "reddit", "email"],
});

function showStatus(message: string, type = "info"): void {
  showStatusBase(statusContainer, message, type);
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

  const generationNumber = document.getElementById("generation-number");
  const genStat = document.getElementById("gen-stat");
  const mutationStat = document.getElementById("mutation-stat");
  const lineageStat = document.getElementById("lineage-stat");

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
    renderGenomeToCanvas(genome, canvas);

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
    renderGenomeToCanvas(candidate.genome, canvas);

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

// Wire up event listeners for buttons
document
  .querySelectorAll<HTMLButtonElement>("[data-example]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const example = btn.dataset.example;
      if (example) {
        startEvolution(example);
      }
    });
  });

generateBtn.addEventListener("click", generateGeneration);
resetBtn.addEventListener("click", resetEvolution);

// Expose selectCandidate to window (used by dynamically rendered candidate cards)
declare global {
  interface Window {
    selectCandidate: (candidateId: string) => void;
    resetEvolutionTutorial: () => void;
  }
}
window.selectCandidate = selectCandidate;

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
