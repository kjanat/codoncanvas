/**
 * @fileoverview DOM Element Management Module (LEGACY)
 *
 * @deprecated This module is legacy code for vanilla JS HTML pages.
 * For React components, DOM elements are managed via refs and state.
 *
 * This file will be removed once all legacy HTML demo pages
 * are migrated to React components.
 *
 * @see src/components/Playground.tsx - React replacement
 * @see src/components/PlaygroundEditor.tsx - Editor with ref
 * @see src/components/PlaygroundCanvas.tsx - Canvas with ref
 *
 * @module playground/dom-manager
 */

import { getElement, querySelector, querySelectorAll } from "@/utils/dom";

// =============================================================================
// Main UI Elements
// =============================================================================

/** Genome code editor textarea */
export const editor = getElement("editor", HTMLTextAreaElement);

/** Main rendering canvas for visual output */
export const canvas = getElement("canvas", HTMLCanvasElement);

/** Run program button */
export const runBtn = getElement("run-btn", HTMLButtonElement);

/** Clear canvas button */
export const clearBtn = getElement("clear-btn", HTMLButtonElement);

/** Example program selector dropdown */
export const exampleSelect = getElement("example-select", HTMLSelectElement);

/** Export image button */
export const exportBtn = getElement("export-btn", HTMLButtonElement);

/** Export audio button */
export const exportAudioBtn = getElement("export-audio-btn", HTMLButtonElement);

/** Export MIDI button */
export const exportMidiBtn = getElement("export-midi-btn", HTMLButtonElement);

/** Save genome to file button */
export const saveGenomeBtn = getElement("save-genome-btn", HTMLButtonElement);

/** Load genome from file button */
export const loadGenomeBtn = getElement("load-genome-btn", HTMLButtonElement);

/** Export student progress button */
export const exportStudentProgressBtn = getElement(
  "export-student-progress-btn",
  HTMLButtonElement,
);

/** Hidden file input for genome loading */
export const genomeFileInput = getElement(
  "genome-file-input",
  HTMLInputElement,
);

/** Status message display span */
export const statusMessage = getElement("status-message", HTMLSpanElement);

/** Codon count display span */
export const codonCount = getElement("codon-count", HTMLSpanElement);

/** Instruction count display span */
export const instructionCount = getElement(
  "instruction-count",
  HTMLSpanElement,
);

/** Status bar container */
export const statusBar = querySelector(".status-bar", HTMLDivElement);

// =============================================================================
// Mutation Buttons
// =============================================================================

/** Silent mutation button - synonymous codon change */
export const silentMutationBtn = getElement(
  "silent-mutation-btn",
  HTMLButtonElement,
);

/** Missense mutation button - amino acid change */
export const missenseMutationBtn = getElement(
  "missense-mutation-btn",
  HTMLButtonElement,
);

/** Nonsense mutation button - premature stop */
export const nonsenseMutationBtn = getElement(
  "nonsense-mutation-btn",
  HTMLButtonElement,
);

/** Frameshift mutation button - reading frame shift */
export const frameshiftMutationBtn = getElement(
  "frameshift-mutation-btn",
  HTMLButtonElement,
);

/** Point mutation button - single base change */
export const pointMutationBtn = getElement(
  "point-mutation-btn",
  HTMLButtonElement,
);

/** Insertion mutation button - add bases */
export const insertionMutationBtn = getElement(
  "insertion-mutation-btn",
  HTMLButtonElement,
);

/** Deletion mutation button - remove bases */
export const deletionMutationBtn = getElement(
  "deletion-mutation-btn",
  HTMLButtonElement,
);

// =============================================================================
// Share System
// =============================================================================

/** Share system container */
export const shareContainer = getElement("share-container", HTMLDivElement);

// =============================================================================
// Example Filter Elements
// =============================================================================

/** Difficulty filter dropdown */
export const difficultyFilter = getElement(
  "difficulty-filter",
  HTMLSelectElement,
);

/** Concept filter dropdown */
export const conceptFilter = getElement("concept-filter", HTMLSelectElement);

/** Example search input */
export const searchInput = getElement("search-input", HTMLInputElement);

/** Example info display panel */
export const exampleInfo = getElement("example-info", HTMLDivElement);

// =============================================================================
// Linter Elements
// =============================================================================

/** Linter panel container */
export const linterPanel = getElement("linter-panel", HTMLDivElement);

/** Linter toggle button */
export const linterToggle = getElement("linter-toggle", HTMLButtonElement);

/** Linter messages container */
export const linterMessages = getElement("linter-messages", HTMLDivElement);

/** Fix all linter errors button */
export const fixAllBtn = getElement("fix-all-btn", HTMLButtonElement);

// =============================================================================
// Diff Viewer Elements
// =============================================================================

/** Diff viewer panel container */
export const diffViewerPanel = getElement("diff-viewer-panel", HTMLDivElement);

/** Diff viewer toggle button */
export const diffViewerToggle = getElement(
  "diff-viewer-toggle",
  HTMLButtonElement,
);

/** Diff viewer clear button */
export const diffViewerClearBtn = getElement(
  "diff-viewer-clear-btn",
  HTMLButtonElement,
);

/** Diff viewer content container */
export const diffViewerContainer = getElement(
  "diff-viewer-container",
  HTMLDivElement,
);

// =============================================================================
// Analyzer Elements
// =============================================================================

/** Analyze genome button */
export const analyzeBtn = getElement("analyze-btn", HTMLButtonElement);

/** Analyzer panel container */
export const analyzerPanel = getElement("analyzer-panel", HTMLDivElement);

/** Analyzer toggle button */
export const analyzerToggle = getElement("analyzer-toggle", HTMLButtonElement);

/** Analyzer content container */
export const analyzerContent = getElement("analyzer-content", HTMLDivElement);

// =============================================================================
// Dynamic Elements
// =============================================================================

/** Comparison button (injected dynamically) */
export let compareBtn: HTMLButtonElement;

// =============================================================================
// Audio Elements
// =============================================================================

/** Audio mode toggle button */
export const audioToggleBtn = getElement("audio-toggle-btn", HTMLButtonElement);

// =============================================================================
// Display Mode Elements
// =============================================================================

/** DNA/RNA nucleotide display toggle button */
export const nucleotideToggleBtn = getElement(
  "nucleotide-toggle-btn",
  HTMLButtonElement,
);

// =============================================================================
// Timeline Elements
// =============================================================================

/** Timeline toggle button */
export const timelineToggleBtn = getElement(
  "timeline-toggle-btn",
  HTMLButtonElement,
);

/** Timeline panel container */
export const timelinePanel = getElement("timeline-panel", HTMLDivElement);

/** Timeline scrubber container */
export const timelineContainer = getElement(
  "timeline-container",
  HTMLDivElement,
);

// =============================================================================
// Biology Comparison Elements
// =============================================================================

/** Biology comparison toggle button */
export const biologyComparisonBtn = getElement(
  "biology-comparison-btn",
  HTMLButtonElement,
);

/** Biology comparison panel container */
export const biologyComparisonPanel = getElement(
  "biology-comparison-panel",
  HTMLDivElement,
);

/** Biology comparison header toggle */
export const biologyComparisonToggle = getElement(
  "biology-comparison-toggle",
  HTMLButtonElement,
);

/** Biology comparison content container */
export const biologyComparisonContainer = getElement(
  "biology-comparison-container",
  HTMLDivElement,
);

// =============================================================================
// Theme Elements
// =============================================================================

/** Theme toggle button (light/dark/system) */
export const themeToggleBtn = getElement("theme-toggle-btn", HTMLButtonElement);

// =============================================================================
// Mode Toggle Elements
// =============================================================================

/** Playground/assessment mode toggle radio buttons */
export const modeToggleBtns = querySelectorAll(
  'input[name="mode"]',
  HTMLInputElement,
);

/** Playground mode container */
export const playgroundContainer = getElement(
  "playground-container",
  HTMLDivElement,
);

/** Assessment mode container */
export const assessmentContainer = getElement(
  "assessment-container",
  HTMLDivElement,
);

// =============================================================================
// Dynamic Element Setters
// =============================================================================

/**
 * Set the comparison button reference.
 * Called after the button is dynamically created.
 * @param btn - The comparison button element
 */
export function setCompareBtn(btn: HTMLButtonElement): void {
  compareBtn = btn;
}
