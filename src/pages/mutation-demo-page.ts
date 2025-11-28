import { DiffViewer, injectDiffViewerStyles } from "../diff-viewer";
import { escapeHtml, getElement } from "../dom-utils";
import { examples } from "../examples";
import { CodonLexer } from "../lexer";
import { getMutationByType } from "../mutations";
import { Canvas2DRenderer } from "../renderer";
import { injectShareStyles, ShareSystem } from "../share-system";
import { mutationTutorial, TutorialManager } from "../tutorial";
import { TutorialUI } from "../tutorial-ui";
import type { MutationType } from "../types";
import "../tutorial-ui.css";
import { CodonVM } from "../vm";

// Inject styles
injectDiffViewerStyles();
injectShareStyles();

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const canvasOriginal = document.getElementById(
  "canvasOriginal",
) as HTMLCanvasElement;
const canvasCurrent = document.getElementById(
  "canvasCurrent",
) as HTMLCanvasElement;
const diffContainer = getElement("diffContainer");
const statusContainer = getElement("statusContainer");
const shareContainer = getElement("shareContainer");

const lexer = new CodonLexer();
const rendererOriginal = new Canvas2DRenderer(canvasOriginal);
const rendererCurrent = new Canvas2DRenderer(canvasCurrent);
const vmOriginal = new CodonVM(rendererOriginal);
const vmCurrent = new CodonVM(rendererCurrent);
const diffViewer = new DiffViewer({
  containerElement: diffContainer,
  showCanvas: false,
});

// Initialize share system
new ShareSystem({
  containerElement: shareContainer,
  getGenome: () => editor.value.trim(),
  appTitle: "CodonCanvas Mutation Lab",
  showQRCode: true,
  socialPlatforms: ["twitter", "reddit", "email"],
});

let originalGenome = editor.value;

function showStatus(message: string, type = "info"): void {
  statusContainer.innerHTML = `<div class="status ${escapeHtml(type)}">${escapeHtml(message)}</div>`;
  setTimeout(() => {
    statusContainer.innerHTML = "";
  }, 5000);
}

function renderGenome(
  genome: string,
  renderer: Canvas2DRenderer,
  vm: CodonVM,
): boolean {
  try {
    renderer.clear();
    const tokens = lexer.tokenize(genome);
    vm.reset();
    vm.run(tokens);
    return true;
  } catch (error) {
    console.error("Render error:", error);
    showStatus(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
    return false;
  }
}

function updateVisualizations(): void {
  const current = editor.value;
  renderGenome(originalGenome, rendererOriginal, vmOriginal);
  renderGenome(current, rendererCurrent, vmCurrent);
}

function loadExample(key: string): void {
  const example = examples[key as keyof typeof examples];
  if (example) {
    editor.value = example.genome;
    originalGenome = editor.value;
    updateVisualizations();
    diffViewer.clear();
    showStatus(`Loaded: ${example.title}`, "success");
  }
}

function applyMutation(type: string): void {
  try {
    const genome = editor.value;
    const result = getMutationByType(type as MutationType, genome);

    editor.value = result.mutated;
    updateVisualizations();
    diffViewer.renderMutation(result);
    showStatus(`Applied ${type} mutation!`, "success");
  } catch (error) {
    console.error("Mutation error:", error);
    showStatus(
      `Mutation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
  }
}

function clearDiff(): void {
  originalGenome = editor.value;
  updateVisualizations();
  diffViewer.clear();
  showStatus("Diff cleared - current genome is now the original", "info");
}

// Expose functions to window
declare global {
  interface Window {
    loadExample: (key: string) => void;
    applyMutation: (type: string) => void;
    clearDiff: () => void;
    resetMutationTutorial: () => void;
  }
}
window.loadExample = loadExample;
window.applyMutation = applyMutation;
window.clearDiff = clearDiff;

// Load genome from URL if present
const urlGenome = ShareSystem.loadFromURL();
if (urlGenome) {
  editor.value = urlGenome;
  originalGenome = urlGenome;
  showStatus("Loaded genome from share link", "success");
  setTimeout(() => {
    updateVisualizations();
  }, 100);
} else {
  // Initial render
  updateVisualizations();
}

// Initialize mutation tutorial
const tutorialManager = new TutorialManager(
  "codoncanvas_mutation_tutorial_completed",
);

// Set up callbacks
tutorialManager.onStepChangeCallback(() => {
  updateVisualizations();
});
tutorialManager.onCompleteCallback(() => {
  showStatus("Tutorial complete! You're now a mutation expert! 🏆", "success");
});

const tutorialUI = new TutorialUI(document.body, tutorialManager);

// Auto-show tutorial for first-time users (after 2 seconds for page load)
if (!tutorialManager.isCompleted()) {
  setTimeout(() => {
    tutorialManager.start(mutationTutorial);
    tutorialUI.show();
  }, 2000);
}

// Add tutorial reset button for testing (hidden in UI, accessible via console)
window.resetMutationTutorial = () => {
  tutorialManager.reset();
  location.reload();
};
