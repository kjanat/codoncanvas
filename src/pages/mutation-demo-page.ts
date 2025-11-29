/**
 * @fileoverview Mutation Demo Page (LEGACY)
 *
 * @deprecated This is a legacy vanilla JS page for pages/demos/mutation.html.
 * Use the React component instead: src/pages/demos/MutationDemo.tsx
 */

import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { examples } from "@/data/examples";
import {
  mutationTutorial,
  TutorialManager,
} from "@/education/tutorials/tutorial";
import { TutorialUI } from "@/education/tutorials/tutorial-ui";
import { getMutationByType } from "@/genetics/mutations";
import type { MutationType } from "@/types";
import { DiffViewer, injectDiffViewerStyles } from "@/ui/diff-viewer";
import { injectShareStyles, ShareSystem } from "@/ui/share-system";
import {
  getElementUnsafe as getElement,
  showStatus as showStatusBase,
} from "@/utils/dom";
import "@/education/tutorials/tutorial-ui.css";
import { CodonVM } from "@/core/vm";

// Inject styles
injectDiffViewerStyles();
injectShareStyles();

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const canvasOriginal = document.getElementById(
  "canvas-original",
) as HTMLCanvasElement;
const canvasCurrent = document.getElementById(
  "canvas-current",
) as HTMLCanvasElement;
const diffContainer = getElement("diff-container");
const statusContainer = getElement("status-container");
const shareContainer = getElement("share-container");

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
  showStatusBase(statusContainer, message, type);
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

// Bind event listeners for example buttons
for (const btn of document.querySelectorAll<HTMLButtonElement>(
  "[data-example]",
)) {
  btn.addEventListener("click", () => {
    const key = btn.dataset.example;
    if (key) loadExample(key);
  });
}

// Bind event listeners for mutation buttons
for (const btn of document.querySelectorAll<HTMLButtonElement>(
  "[data-mutation]",
)) {
  btn.addEventListener("click", () => {
    const type = btn.dataset.mutation;
    if (type) applyMutation(type);
  });
}

// Bind clear diff button
document.getElementById("clear-diff-btn")?.addEventListener("click", clearDiff);

// Expose tutorial reset to window for debugging
declare global {
  interface Window {
    resetMutationTutorial: () => void;
  }
}

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
