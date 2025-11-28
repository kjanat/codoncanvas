/**
 * CodonCanvas Playground - Main Entry Point
 * Refactored version using modular architecture
 *
 * This file coordinates all playground modules and exports from the original playground.ts
 * for backward compatibility with index.html
 */

// Re-export all public modules for backward compatibility
export * from "./playground/dom-manager";
export * from "./playground/export-handlers";
export * from "./playground/genome-handlers";
export * from "./playground/linter-handlers";
export * from "./playground/ui-state";
export * from "./playground/ui-utils";

import type { Achievement } from "./achievement-engine";
import { DiffViewer, injectDiffViewerStyles } from "./diff-viewer";
import {
  type Concept,
  type ExampleDifficulty,
  type ExampleKey,
  type ExampleMetadata,
  examples,
} from "./examples";
import { injectShareStyles, ShareSystem } from "./share-system";
import { TutorialManager } from "./tutorial";
import { initializeTutorial } from "./tutorial-ui";
import { CodonVM } from "./vm";
import "./tutorial-ui.css";
import "./achievement-ui.css";
import { AssessmentUI } from "./assessment-ui";
// Import DOM elements
import {
  assessmentContainer,
  audioToggleBtn,
  clearBtn,
  conceptFilter,
  deletionMutationBtn,
  difficultyFilter,
  diffViewerContainer,
  editor,
  exampleInfo,
  exampleSelect,
  exportBtn,
  exportStudentProgressBtn,
  fixAllBtn,
  frameshiftMutationBtn,
  genomeFileInput,
  insertionMutationBtn,
  linterToggle,
  loadGenomeBtn,
  missenseMutationBtn,
  modeToggleBtns,
  nonsenseMutationBtn,
  playgroundContainer,
  pointMutationBtn,
  runBtn,
  saveGenomeBtn,
  searchInput,
  shareContainer,
  silentMutationBtn,
  themeToggleBtn,
  timelinePanel,
  timelineToggleBtn,
} from "./playground/dom-manager";
// Import handlers
import {
  exportImage,
  exportStudentProgress,
  saveGenome,
} from "./playground/export-handlers";
import { handleFileLoad, loadGenome } from "./playground/genome-handlers";
import {
  fixAllErrors,
  runLinter,
  toggleLinter,
} from "./playground/linter-handlers";
import { applyMutation } from "./playground/mutation-handlers";
// Import state managers
import {
  achievementEngine,
  achievementUI,
  assessmentEngine,
  assessmentUI,
  audioRenderer,
  lexer,
  type RenderMode,
  renderer,
  renderMode,
  researchMetrics,
  setAssessmentUI,
  setLastSnapshots,
  setRenderMode,
  setTimelineVisible,
  themeManager,
  timelineScrubber,
  timelineVisible,
  vm,
} from "./playground/ui-state";
// Import UI utilities
import {
  setStatus,
  updateStats,
  updateThemeButton,
} from "./playground/ui-utils";
import { injectTimelineStyles } from "./timeline-scrubber";

// Initialize UI button state
updateThemeButton();

// DiffViewer initialization
injectDiffViewerStyles();
const _diffViewer = new DiffViewer({
  containerElement: diffViewerContainer,
});

// Share system initialization
injectShareStyles();
const _shareSystem = new ShareSystem({
  containerElement: shareContainer,
  getGenome: () => editor.value,
});

// Timeline scrubber initialization
injectTimelineStyles();

// Track drawing operations from executed tokens
function trackDrawingOperations(tokens: { text: string }[]) {
  const allUnlocked: Achievement[] = [];

  for (const token of tokens) {
    const codon = token.text;

    if (["GGA", "GGC", "GGG", "GGT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn("CIRCLE"));
    } else if (["CCA", "CCC", "CCG", "CCT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn("RECT"));
    } else if (["AAA", "AAC", "AAG", "AAT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn("LINE"));
    } else if (["GCA", "GCC", "GCG", "GCT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn("TRIANGLE"));
    } else if (["GTA", "GTC", "GTG", "GTT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn("ELLIPSE"));
    } else if (["TTA", "TTC", "TTG", "TTT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackColorUsed());
    } else if (["ACA", "ACC", "ACG", "ACT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackTransformApplied("TRANSLATE"));
    } else if (["AGA", "AGC", "AGG", "AGT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackTransformApplied("ROTATE"));
    } else if (["CGA", "CGC", "CGG", "CGT"].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackTransformApplied("SCALE"));
    }
  }

  return allUnlocked;
}

/**
 * Track execution metrics and achievements
 */
function trackExecutionComplete(
  tokens: { text: string }[],
  instructionCount: number,
  mode: RenderMode,
): void {
  researchMetrics.trackGenomeExecuted({
    timestamp: Date.now(),
    renderMode: mode,
    genomeLength: tokens.length,
    instructionCount,
    success: true,
  });

  const opcodes = tokens.map((t) => t.text);
  const unlocked2 = achievementEngine.trackGenomeExecuted(opcodes);
  const unlocked3 = trackDrawingOperations(tokens);
  achievementUI.handleUnlocks([...unlocked2, ...unlocked3]);
}

/**
 * Run the genome program
 */
async function runProgram() {
  try {
    const source = editor.value;

    const unlocked1 = achievementEngine.trackGenomeCreated(
      source.replace(/\s+/g, "").length,
    );
    achievementUI.handleUnlocks(unlocked1);

    researchMetrics.trackGenomeCreated(source.replace(/\s+/g, "").length);

    const tokens = lexer.tokenize(source);
    updateStats(tokens.length, 0);

    const structureErrors = lexer.validateStructure(tokens);
    const criticalErrors = structureErrors.filter(
      (e) => e.severity === "error",
    );

    if (criticalErrors.length > 0) {
      setStatus(`Error: ${criticalErrors[0].message}`, "error");
      return;
    }

    const frameErrors = lexer.validateFrame(source);
    if (frameErrors.length > 0) {
      setStatus(`Warning: ${frameErrors[0].message}`, "error");
    }

    if (renderMode === "audio") {
      const audioVM = new CodonVM(audioRenderer);
      audioRenderer.clear();
      audioRenderer.startRecording();
      audioVM.reset();
      const snapshots = audioVM.run(tokens);
      setLastSnapshots(snapshots);

      updateStats(tokens.length, audioVM.state.instructionCount);
      setStatus(
        `♪ Playing ${audioVM.state.instructionCount} audio instructions`,
        "success",
      );
      trackExecutionComplete(tokens, audioVM.state.instructionCount, "audio");
    } else if (renderMode === "visual") {
      vm.reset();
      const snapshots = vm.run(tokens);
      setLastSnapshots(snapshots);

      updateStats(tokens.length, vm.state.instructionCount);
      setStatus(
        `Executed ${vm.state.instructionCount} instructions successfully`,
        "success",
      );
      trackExecutionComplete(tokens, vm.state.instructionCount, "visual");
    } else {
      const audioVM = new CodonVM(audioRenderer);
      renderer.clear();
      audioRenderer.clear();
      audioRenderer.startRecording();
      audioVM.reset();
      vm.reset();

      const [audioSnapshots, _visualSnapshots] = await Promise.all([
        Promise.resolve(audioVM.run(tokens)),
        Promise.resolve(vm.run(tokens)),
      ]);
      setLastSnapshots(audioSnapshots);

      updateStats(tokens.length, vm.state.instructionCount);
      setStatus(
        `♪🎨 Playing ${audioVM.state.instructionCount} audio + visual instructions`,
        "success",
      );
      trackExecutionComplete(tokens, audioVM.state.instructionCount, "both");
    }
  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Error: ${error.message}`, "error");
      researchMetrics.trackError("execution", error.message);
    } else if (Array.isArray(error)) {
      setStatus(`Error: ${error[0].message}`, "error");
      researchMetrics.trackError("parse", error[0].message);
    } else {
      setStatus("Unknown error occurred", "error");
      researchMetrics.trackError("unknown", "Unknown error occurred");
    }
  }
}

/**
 * Clear canvas
 */
function clearCanvas() {
  vm.reset();
  renderer.clear();
  setStatus("Canvas cleared", "info");
  updateStats(0, 0);
}

/**
 * Get filtered examples based on current filter selections
 */
function getFilteredExamples(): Array<[ExampleKey, ExampleMetadata]> {
  const difficulty = difficultyFilter.value as ExampleDifficulty | "";
  const concept = conceptFilter.value as Concept | "";
  const search = searchInput.value.toLowerCase().trim();

  return Object.entries(examples).filter(([_key, ex]) => {
    if (difficulty && ex.difficulty !== difficulty) {
      return false;
    }

    if (concept && !ex.concepts.includes(concept)) {
      return false;
    }

    if (search) {
      const searchableText = [
        ex.title,
        ex.description,
        ...ex.keywords,
        ...ex.concepts,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(search)) {
        return false;
      }
    }

    return true;
  }) as Array<[ExampleKey, ExampleMetadata]>;
}

/**
 * Update example dropdown with filtered options
 */
function updateExampleDropdown() {
  const filtered = getFilteredExamples();

  exampleSelect.textContent = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Load Example...";
  exampleSelect.appendChild(defaultOption);

  const grouped = {
    beginner: [] as Array<[ExampleKey, ExampleMetadata]>,
    intermediate: [] as Array<[ExampleKey, ExampleMetadata]>,
    advanced: [] as Array<[ExampleKey, ExampleMetadata]>,
    "advanced-showcase": [] as Array<[ExampleKey, ExampleMetadata]>,
  };

  filtered.forEach(([key, ex]) => {
    grouped[ex.difficulty].push([key, ex]);
  });

  if (grouped.beginner.length > 0) {
    const beginnerGroup = document.createElement("optgroup");
    beginnerGroup.label = "🌱 Beginner";
    grouped.beginner.forEach(([key, ex]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = ex.title;
      beginnerGroup.appendChild(option);
    });
    exampleSelect.appendChild(beginnerGroup);
  }

  if (grouped.intermediate.length > 0) {
    const intermediateGroup = document.createElement("optgroup");
    intermediateGroup.label = "🌿 Intermediate";
    grouped.intermediate.forEach(([key, ex]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = ex.title;
      intermediateGroup.appendChild(option);
    });
    exampleSelect.appendChild(intermediateGroup);
  }

  if (grouped.advanced.length > 0) {
    const advancedGroup = document.createElement("optgroup");
    advancedGroup.label = "🌳 Advanced";
    grouped.advanced.forEach(([key, ex]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = ex.title;
      advancedGroup.appendChild(option);
    });
    exampleSelect.appendChild(advancedGroup);
  }

  if (grouped["advanced-showcase"].length > 0) {
    const showcaseGroup = document.createElement("optgroup");
    showcaseGroup.label = "✨ Advanced Showcase";
    grouped["advanced-showcase"].forEach(([key, ex]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = ex.title;
      showcaseGroup.appendChild(option);
    });
    exampleSelect.appendChild(showcaseGroup);
  }

  const totalCount = Object.keys(examples).length;
  const filteredCount = filtered.length;

  if (filteredCount < totalCount) {
    exampleSelect.options[0].textContent = `Load Example... (${filteredCount} of ${totalCount})`;
  }
}

/**
 * Show example info
 */
function showExampleInfo(key: ExampleKey) {
  const ex = examples[key];
  if (!ex) {
    exampleInfo.style.display = "none";
    return;
  }

  exampleInfo.textContent = "";

  const titleDiv = document.createElement("div");
  titleDiv.style.marginBottom = "8px";

  const titleStrong = document.createElement("strong");
  titleStrong.textContent = ex.title;
  titleDiv.appendChild(titleStrong);

  const difficultySpan = document.createElement("span");
  difficultySpan.style.cssText =
    "float: right; font-size: 0.85em; opacity: 0.7;";
  difficultySpan.textContent = ex.difficulty;
  titleDiv.appendChild(difficultySpan);

  const descDiv = document.createElement("div");
  descDiv.style.cssText = "font-size: 0.9em; margin-bottom: 8px;";
  descDiv.textContent = ex.description;

  const metaDiv = document.createElement("div");
  metaDiv.style.cssText = "font-size: 0.85em; opacity: 0.7;";

  const conceptsDiv = document.createElement("div");
  const conceptsLabel = document.createElement("strong");
  conceptsLabel.textContent = "Concepts:";
  conceptsDiv.appendChild(conceptsLabel);
  conceptsDiv.appendChild(
    document.createTextNode(` ${ex.concepts.join(", ")}`),
  );

  const mutationsDiv = document.createElement("div");
  const mutationsLabel = document.createElement("strong");
  mutationsLabel.textContent = "Good for mutations:";
  mutationsDiv.appendChild(mutationsLabel);
  mutationsDiv.appendChild(
    document.createTextNode(` ${ex.goodForMutations.join(", ")}`),
  );

  metaDiv.appendChild(conceptsDiv);
  metaDiv.appendChild(mutationsDiv);

  exampleInfo.appendChild(titleDiv);
  exampleInfo.appendChild(descDiv);
  exampleInfo.appendChild(metaDiv);
  exampleInfo.style.display = "block";
}

/**
 * Load example from dropdown
 */
function loadExample() {
  const key = exampleSelect.value as ExampleKey;
  if (key && examples[key]) {
    editor.value = examples[key].genome;
    setStatus(`Loaded: ${examples[key].title}`, "info");
    showExampleInfo(key);
    runLinter(examples[key].genome);
    exampleSelect.value = "";
  }
}

/**
 * Toggle audio rendering mode
 */
async function toggleAudio() {
  const modes: RenderMode[] = ["visual", "audio", "both"];
  const currentIndex = modes.indexOf(renderMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  const newMode = modes[nextIndex];

  setRenderMode(newMode);

  if (newMode === "visual") {
    audioToggleBtn.textContent = "🎨 Visual";
    audioToggleBtn.title = "Click to switch to audio mode";
  } else if (newMode === "audio") {
    audioToggleBtn.textContent = "🎵 Audio";
    audioToggleBtn.title = "Click to switch to both modes";
  } else {
    audioToggleBtn.textContent = "♪🎨 Both";
    audioToggleBtn.title = "Click to switch to visual mode";
  }

  setStatus(`Switched to ${newMode} mode`, "info");
}

/**
 * Toggle timeline visibility
 */
function toggleTimeline() {
  setTimelineVisible(!timelineVisible);
  if (timelineVisible) {
    timelinePanel.style.display = "block";
    timelineToggleBtn.textContent = "⏱️ Hide Timeline";
    const source = editor.value.trim();
    if (source) {
      try {
        timelineScrubber.loadGenome(source);
      } catch (error) {
        setStatus(
          `Timeline error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "error",
        );
      }
    }
  } else {
    timelinePanel.style.display = "none";
    timelineToggleBtn.textContent = "⏱️ Timeline";
  }
}

/**
 * Switch between playground and assessment modes
 */
function switchMode(mode: "playground" | "assessment") {
  if (mode === "playground") {
    playgroundContainer.style.display = "contents";
    assessmentContainer.style.display = "none";
  } else {
    playgroundContainer.style.display = "none";
    assessmentContainer.style.display = "grid";
    if (!assessmentUI) {
      const ui = new AssessmentUI(assessmentEngine, assessmentContainer);
      setAssessmentUI(ui);
    }
  }
}

// Event listeners
runBtn.addEventListener("click", runProgram);
clearBtn.addEventListener("click", clearCanvas);
audioToggleBtn.addEventListener("click", toggleAudio);
timelineToggleBtn.addEventListener("click", toggleTimeline);
themeToggleBtn.addEventListener("click", () => {
  themeManager.cycleTheme();
  updateThemeButton();
  setStatus(`Theme changed to ${themeManager.getThemeDisplayName()}`, "info");
});
exampleSelect.addEventListener("change", loadExample);
exportBtn.addEventListener("click", exportImage);
saveGenomeBtn.addEventListener("click", saveGenome);
loadGenomeBtn.addEventListener("click", loadGenome);
genomeFileInput.addEventListener("change", handleFileLoad);
exportStudentProgressBtn.addEventListener("click", exportStudentProgress);
fixAllBtn.addEventListener("click", fixAllErrors);
linterToggle.addEventListener("click", toggleLinter);

// Mutation button listeners
silentMutationBtn.addEventListener("click", () => applyMutation("silent"));
missenseMutationBtn.addEventListener("click", () => applyMutation("missense"));
nonsenseMutationBtn.addEventListener("click", () => applyMutation("nonsense"));
frameshiftMutationBtn.addEventListener("click", () =>
  applyMutation("frameshift"),
);
pointMutationBtn.addEventListener("click", () => applyMutation("point"));
insertionMutationBtn.addEventListener("click", () =>
  applyMutation("insertion"),
);
deletionMutationBtn.addEventListener("click", () => applyMutation("deletion"));

// Example filter listeners
difficultyFilter.addEventListener("change", updateExampleDropdown);
conceptFilter.addEventListener("change", updateExampleDropdown);
searchInput.addEventListener("input", updateExampleDropdown);

// Mode toggle listeners
modeToggleBtns.forEach((btn) => {
  btn.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    switchMode(target.value as "playground" | "assessment");
  });
});

// Initialize example dropdown
updateExampleDropdown();

// Run linter on editor input
editor.addEventListener("input", () => {
  runLinter(editor.value);
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl+Enter or Cmd+Enter to run
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runProgram();
  }
});

// Initialize tutorials
const tutorialManager = new TutorialManager();
const tutorialContainer = document.querySelector(
  ".tutorial-container",
) as HTMLElement;
if (tutorialContainer) {
  initializeTutorial(tutorialContainer, tutorialManager, editor);
}

// Optional: Export individual pieces for testing
export {
  runProgram,
  clearCanvas,
  loadExample,
  toggleAudio,
  toggleTimeline,
  switchMode,
};
