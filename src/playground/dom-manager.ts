/**
 * DOM Element Management Module
 * Handles all DOM element access and initialization with type-safe utilities
 */

import { getElement, querySelector, querySelectorAll } from "../utils/dom";

// Main UI elements
export const editor = getElement("editor", HTMLTextAreaElement);
export const canvas = getElement("canvas", HTMLCanvasElement);
export const runBtn = getElement("runBtn", HTMLButtonElement);
export const clearBtn = getElement("clearBtn", HTMLButtonElement);
export const exampleSelect = getElement("exampleSelect", HTMLSelectElement);
export const exportBtn = getElement("exportBtn", HTMLButtonElement);
export const exportAudioBtn = getElement("exportAudioBtn", HTMLButtonElement);
export const exportMidiBtn = getElement("exportMidiBtn", HTMLButtonElement);
export const saveGenomeBtn = getElement("saveGenomeBtn", HTMLButtonElement);
export const loadGenomeBtn = getElement("loadGenomeBtn", HTMLButtonElement);
export const exportStudentProgressBtn = getElement(
  "exportStudentProgressBtn",
  HTMLButtonElement,
);
export const genomeFileInput = getElement("genomeFileInput", HTMLInputElement);
export const statusMessage = getElement("statusMessage", HTMLSpanElement);
export const codonCount = getElement("codonCount", HTMLSpanElement);
export const instructionCount = getElement("instructionCount", HTMLSpanElement);
export const statusBar = querySelector(".status-bar", HTMLDivElement);

// Mutation buttons
export const silentMutationBtn = getElement(
  "silentMutationBtn",
  HTMLButtonElement,
);
export const missenseMutationBtn = getElement(
  "missenseMutationBtn",
  HTMLButtonElement,
);
export const nonsenseMutationBtn = getElement(
  "nonsenseMutationBtn",
  HTMLButtonElement,
);
export const frameshiftMutationBtn = getElement(
  "frameshiftMutationBtn",
  HTMLButtonElement,
);
export const pointMutationBtn = getElement(
  "pointMutationBtn",
  HTMLButtonElement,
);
export const insertionMutationBtn = getElement(
  "insertionMutationBtn",
  HTMLButtonElement,
);
export const deletionMutationBtn = getElement(
  "deletionMutationBtn",
  HTMLButtonElement,
);

// Share system
export const shareContainer = getElement("shareContainer", HTMLDivElement);

// Example filter elements
export const difficultyFilter = getElement(
  "difficultyFilter",
  HTMLSelectElement,
);
export const conceptFilter = getElement("conceptFilter", HTMLSelectElement);
export const searchInput = getElement("searchInput", HTMLInputElement);
export const exampleInfo = getElement("exampleInfo", HTMLDivElement);

// Linter elements
export const linterPanel = getElement("linterPanel", HTMLDivElement);
export const linterToggle = getElement("linterToggle", HTMLButtonElement);
export const linterMessages = getElement("linterMessages", HTMLDivElement);
export const fixAllBtn = getElement("fixAllBtn", HTMLButtonElement);

// DiffViewer elements
export const diffViewerPanel = getElement("diffViewerPanel", HTMLDivElement);
export const diffViewerToggle = getElement(
  "diffViewerToggle",
  HTMLButtonElement,
);
export const diffViewerClearBtn = getElement(
  "diffViewerClearBtn",
  HTMLButtonElement,
);
export const diffViewerContainer = getElement(
  "diffViewerContainer",
  HTMLDivElement,
);

// Analyzer elements
export const analyzeBtn = getElement("analyzeBtn", HTMLButtonElement);
export const analyzerPanel = getElement("analyzerPanel", HTMLDivElement);
export const analyzerToggle = getElement("analyzerToggle", HTMLButtonElement);
export const analyzerContent = getElement("analyzerContent", HTMLDivElement);

// Comparison button (will be injected)
export let compareBtn: HTMLButtonElement;

// Audio elements
export const audioToggleBtn = getElement("audioToggleBtn", HTMLButtonElement);

// Timeline elements
export const timelineToggleBtn = getElement(
  "timelineToggleBtn",
  HTMLButtonElement,
);
export const timelinePanel = getElement("timelinePanel", HTMLDivElement);
export const timelineContainer = getElement(
  "timelineContainer",
  HTMLDivElement,
);

// Theme elements
export const themeToggleBtn = getElement("themeToggleBtn", HTMLButtonElement);

// Mode toggle elements
export const modeToggleBtns = querySelectorAll(
  'input[name="mode"]',
  HTMLInputElement,
);
export const playgroundContainer = getElement(
  "playgroundContainer",
  HTMLDivElement,
);
export const assessmentContainer = getElement(
  "assessmentContainer",
  HTMLDivElement,
);

/**
 * Set comparison button reference
 */
export function setCompareBtn(btn: HTMLButtonElement) {
  compareBtn = btn;
}
