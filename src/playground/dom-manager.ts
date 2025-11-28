/**
 * DOM Element Management Module
 * Handles all DOM element access and initialization with type-safe utilities
 */

import { getElement, querySelector, querySelectorAll } from "@/utils/dom";

// Main UI elements
export const editor = getElement("editor", HTMLTextAreaElement);
export const canvas = getElement("canvas", HTMLCanvasElement);
export const runBtn = getElement("run-btn", HTMLButtonElement);
export const clearBtn = getElement("clear-btn", HTMLButtonElement);
export const exampleSelect = getElement("example-select", HTMLSelectElement);
export const exportBtn = getElement("export-btn", HTMLButtonElement);
export const exportAudioBtn = getElement("export-audio-btn", HTMLButtonElement);
export const exportMidiBtn = getElement("export-midi-btn", HTMLButtonElement);
export const saveGenomeBtn = getElement("save-genome-btn", HTMLButtonElement);
export const loadGenomeBtn = getElement("load-genome-btn", HTMLButtonElement);
export const exportStudentProgressBtn = getElement(
  "export-student-progress-btn",
  HTMLButtonElement,
);
export const genomeFileInput = getElement(
  "genome-file-input",
  HTMLInputElement,
);
export const statusMessage = getElement("status-message", HTMLSpanElement);
export const codonCount = getElement("codon-count", HTMLSpanElement);
export const instructionCount = getElement(
  "instruction-count",
  HTMLSpanElement,
);
export const statusBar = querySelector(".status-bar", HTMLDivElement);

// Mutation buttons
export const silentMutationBtn = getElement(
  "silent-mutation-btn",
  HTMLButtonElement,
);
export const missenseMutationBtn = getElement(
  "missense-mutation-btn",
  HTMLButtonElement,
);
export const nonsenseMutationBtn = getElement(
  "nonsense-mutation-btn",
  HTMLButtonElement,
);
export const frameshiftMutationBtn = getElement(
  "frameshift-mutation-btn",
  HTMLButtonElement,
);
export const pointMutationBtn = getElement(
  "point-mutation-btn",
  HTMLButtonElement,
);
export const insertionMutationBtn = getElement(
  "insertion-mutation-btn",
  HTMLButtonElement,
);
export const deletionMutationBtn = getElement(
  "deletion-mutation-btn",
  HTMLButtonElement,
);

// Share system
export const shareContainer = getElement("share-container", HTMLDivElement);

// Example filter elements
export const difficultyFilter = getElement(
  "difficulty-filter",
  HTMLSelectElement,
);
export const conceptFilter = getElement("concept-filter", HTMLSelectElement);
export const searchInput = getElement("search-input", HTMLInputElement);
export const exampleInfo = getElement("example-info", HTMLDivElement);

// Linter elements
export const linterPanel = getElement("linter-panel", HTMLDivElement);
export const linterToggle = getElement("linter-toggle", HTMLButtonElement);
export const linterMessages = getElement("linter-messages", HTMLDivElement);
export const fixAllBtn = getElement("fix-all-btn", HTMLButtonElement);

// DiffViewer elements
export const diffViewerPanel = getElement("diff-viewer-panel", HTMLDivElement);
export const diffViewerToggle = getElement(
  "diff-viewer-toggle",
  HTMLButtonElement,
);
export const diffViewerClearBtn = getElement(
  "diff-viewer-clear-btn",
  HTMLButtonElement,
);
export const diffViewerContainer = getElement(
  "diff-viewer-container",
  HTMLDivElement,
);

// Analyzer elements
export const analyzeBtn = getElement("analyze-btn", HTMLButtonElement);
export const analyzerPanel = getElement("analyzer-panel", HTMLDivElement);
export const analyzerToggle = getElement("analyzer-toggle", HTMLButtonElement);
export const analyzerContent = getElement("analyzer-content", HTMLDivElement);

// Comparison button (will be injected)
export let compareBtn: HTMLButtonElement;

// Audio elements
export const audioToggleBtn = getElement("audio-toggle-btn", HTMLButtonElement);

// Timeline elements
export const timelineToggleBtn = getElement(
  "timeline-toggle-btn",
  HTMLButtonElement,
);
export const timelinePanel = getElement("timeline-panel", HTMLDivElement);
export const timelineContainer = getElement(
  "timeline-container",
  HTMLDivElement,
);

// Theme elements
export const themeToggleBtn = getElement("theme-toggle-btn", HTMLButtonElement);

// Mode toggle elements
export const modeToggleBtns = querySelectorAll(
  'input[name="mode"]',
  HTMLInputElement,
);
export const playgroundContainer = getElement(
  "playground-container",
  HTMLDivElement,
);
export const assessmentContainer = getElement(
  "assessment-container",
  HTMLDivElement,
);

/**
 * Set comparison button reference
 */
export function setCompareBtn(btn: HTMLButtonElement) {
  compareBtn = btn;
}
