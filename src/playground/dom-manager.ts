/**
 * DOM Element Management Module
 * Handles all DOM element access and initialization
 */

// Main UI elements
export const editor = document.getElementById("editor") as HTMLTextAreaElement;
export const canvas = document.getElementById("canvas") as HTMLCanvasElement;
export const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
export const clearBtn = document.getElementById(
  "clearBtn",
) as HTMLButtonElement;
export const exampleSelect = document.getElementById(
  "exampleSelect",
) as HTMLSelectElement;
export const exportBtn = document.getElementById(
  "exportBtn",
) as HTMLButtonElement;
export const exportAudioBtn = document.getElementById(
  "exportAudioBtn",
) as HTMLButtonElement;
export const exportMidiBtn = document.getElementById(
  "exportMidiBtn",
) as HTMLButtonElement;
export const saveGenomeBtn = document.getElementById(
  "saveGenomeBtn",
) as HTMLButtonElement;
export const loadGenomeBtn = document.getElementById(
  "loadGenomeBtn",
) as HTMLButtonElement;
export const exportStudentProgressBtn = document.getElementById(
  "exportStudentProgressBtn",
) as HTMLButtonElement;
export const genomeFileInput = document.getElementById(
  "genomeFileInput",
) as HTMLInputElement;
export const statusMessage = document.getElementById(
  "statusMessage",
) as HTMLSpanElement;
export const codonCount = document.getElementById(
  "codonCount",
) as HTMLSpanElement;
export const instructionCount = document.getElementById(
  "instructionCount",
) as HTMLSpanElement;
export const statusBar = document.querySelector(
  ".status-bar",
) as HTMLDivElement;

// Mutation buttons
export const silentMutationBtn = document.getElementById(
  "silentMutationBtn",
) as HTMLButtonElement;
export const missenseMutationBtn = document.getElementById(
  "missenseMutationBtn",
) as HTMLButtonElement;
export const nonsenseMutationBtn = document.getElementById(
  "nonsenseMutationBtn",
) as HTMLButtonElement;
export const frameshiftMutationBtn = document.getElementById(
  "frameshiftMutationBtn",
) as HTMLButtonElement;
export const pointMutationBtn = document.getElementById(
  "pointMutationBtn",
) as HTMLButtonElement;
export const insertionMutationBtn = document.getElementById(
  "insertionMutationBtn",
) as HTMLButtonElement;
export const deletionMutationBtn = document.getElementById(
  "deletionMutationBtn",
) as HTMLButtonElement;

// Share system
export const shareContainer = document.getElementById(
  "shareContainer",
) as HTMLDivElement;

// Example filter elements
export const difficultyFilter = document.getElementById(
  "difficultyFilter",
) as HTMLSelectElement;
export const conceptFilter = document.getElementById(
  "conceptFilter",
) as HTMLSelectElement;
export const searchInput = document.getElementById(
  "searchInput",
) as HTMLInputElement;
export const exampleInfo = document.getElementById(
  "exampleInfo",
) as HTMLDivElement;

// Linter elements
export const linterPanel = document.getElementById(
  "linterPanel",
) as HTMLDivElement;
export const linterToggle = document.getElementById(
  "linterToggle",
) as HTMLButtonElement;
export const linterMessages = document.getElementById(
  "linterMessages",
) as HTMLDivElement;
export const fixAllBtn = document.getElementById(
  "fixAllBtn",
) as HTMLButtonElement;

// DiffViewer elements
export const diffViewerPanel = document.getElementById(
  "diffViewerPanel",
) as HTMLDivElement;
export const diffViewerToggle = document.getElementById(
  "diffViewerToggle",
) as HTMLButtonElement;
export const diffViewerClearBtn = document.getElementById(
  "diffViewerClearBtn",
) as HTMLButtonElement;
export const diffViewerContainer = document.getElementById(
  "diffViewerContainer",
) as HTMLDivElement;

// Analyzer elements
export const analyzeBtn = document.getElementById(
  "analyzeBtn",
) as HTMLButtonElement;
export const analyzerPanel = document.getElementById(
  "analyzerPanel",
) as HTMLDivElement;
export const analyzerToggle = document.getElementById(
  "analyzerToggle",
) as HTMLButtonElement;
export const analyzerContent = document.getElementById(
  "analyzerContent",
) as HTMLDivElement;

// Comparison button (will be injected)
export let compareBtn: HTMLButtonElement;

// Audio elements
export const audioToggleBtn = document.getElementById(
  "audioToggleBtn",
) as HTMLButtonElement;

// Timeline elements
export const timelineToggleBtn = document.getElementById(
  "timelineToggleBtn",
) as HTMLButtonElement;
export const timelinePanel = document.getElementById(
  "timelinePanel",
) as HTMLDivElement;
export const timelineContainer = document.getElementById(
  "timelineContainer",
) as HTMLDivElement;

// Theme elements
export const themeToggleBtn = document.getElementById(
  "themeToggleBtn",
) as HTMLButtonElement;

// Mode toggle elements
export const modeToggleBtns = document.querySelectorAll(
  'input[name="mode"]',
) as NodeListOf<HTMLInputElement>;
export const playgroundContainer = document.getElementById(
  "playgroundContainer",
) as HTMLDivElement;
export const assessmentContainer = document.getElementById(
  "assessmentContainer",
) as HTMLDivElement;

/**
 * Set comparison button reference
 */
export function setCompareBtn(btn: HTMLButtonElement) {
  compareBtn = btn;
}
