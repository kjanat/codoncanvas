/**
 * DOM Manager Test Suite
 *
 * Tests for the DOM element management module that provides
 * type-safe access to all playground UI elements.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

describe("DOM Manager", () => {
  // Mock DOM elements storage
  let elements: Record<string, HTMLElement>;
  let mockCanvas: HTMLCanvasElement;
  let mockStatusBar: HTMLDivElement;

  // Dynamically imported module
  let domManager: typeof import("@/playground/dom-manager");

  beforeAll(async () => {
    // Create mock canvas
    mockCanvas = document.createElement("canvas");
    mockCanvas.id = "canvas";
    mockCanvas.width = 400;
    mockCanvas.height = 400;
    document.body.appendChild(mockCanvas);

    // Create status bar
    mockStatusBar = document.createElement("div");
    mockStatusBar.className = "status-bar";
    document.body.appendChild(mockStatusBar);

    // Initialize elements map (for reference if needed, but we rely on DOM now)
    elements = {
      canvas: mockCanvas,
    };

    createMockElements();

    // Dynamically import the module after DOM setup
    // We need to re-import to ensure it grabs the new elements
    domManager = await import("@/playground/dom-manager");
  });

  function createMockElements() {
    const spanElements = ["status-message", "codon-count", "instruction-count"];
    const textareaElements = ["editor"];
    const selectElements = [
      "example-select",
      "difficulty-filter",
      "concept-filter",
    ];
    const inputElements = ["genome-file-input", "search-input"];
    const buttonElements = [
      "run-btn",
      "clear-btn",
      "export-btn",
      "export-audio-btn",
      "export-midi-btn",
      "save-genome-btn",
      "load-genome-btn",
      "export-student-progress-btn",
      "silent-mutation-btn",
      "missense-mutation-btn",
      "nonsense-mutation-btn",
      "frameshift-mutation-btn",
      "point-mutation-btn",
      "insertion-mutation-btn",
      "deletion-mutation-btn",
      "linter-toggle",
      "fix-all-btn",
      "diff-viewer-toggle",
      "diff-viewer-clear-btn",
      "analyze-btn",
      "analyzer-toggle",
      "audio-toggle-btn",
      "timeline-toggle-btn",
      "theme-toggle-btn",
    ];
    const divElements = [
      "share-container",
      "example-info",
      "linter-panel",
      "linter-messages",
      "diff-viewer-panel",
      "diff-viewer-container",
      "analyzer-panel",
      "analyzer-content",
      "timeline-panel",
      "timeline-container",
      "playground-container",
      "assessment-container",
    ];

    const allIds = [
      ...spanElements,
      ...textareaElements,
      ...selectElements,
      ...inputElements,
      ...buttonElements,
      ...divElements,
    ];

    for (const id of allIds) {
      if (!document.getElementById(id)) {
        const el = createElementByType(
          id,
          textareaElements,
          selectElements,
          inputElements,
          buttonElements,
          spanElements,
        );
        el.id = id;
        document.body.appendChild(el);
        elements[id] = el;
      }
    }

    // Create mode toggle buttons
    const modeToggle1 = document.createElement("input");
    modeToggle1.type = "radio";
    modeToggle1.name = "mode";
    document.body.appendChild(modeToggle1);

    const modeToggle2 = document.createElement("input");
    modeToggle2.type = "radio";
    modeToggle2.name = "mode";
    document.body.appendChild(modeToggle2);
  }

  function createElementByType(
    id: string,
    textareaElements: string[],
    selectElements: string[],
    inputElements: string[],
    buttonElements: string[],
    spanElements: string[],
  ): HTMLElement {
    if (textareaElements.includes(id)) {
      return document.createElement("textarea");
    }
    if (selectElements.includes(id)) {
      return document.createElement("select");
    }
    if (inputElements.includes(id)) {
      return document.createElement("input");
    }
    if (buttonElements.includes(id)) {
      return document.createElement("button");
    }
    if (spanElements.includes(id)) {
      return document.createElement("span");
    }
    return document.createElement("div");
  }

  afterAll(() => {
    // Clean up DOM
    document.body.innerHTML = "";
  });

  // Element Exports
  describe("element exports", () => {
    test("exports editor as HTMLTextAreaElement", () => {
      expect(domManager.editor).toBeInstanceOf(HTMLTextAreaElement);
    });

    test("exports canvas as HTMLCanvasElement", () => {
      expect(domManager.canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    test("exports runBtn as HTMLButtonElement", () => {
      expect(domManager.runBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports clearBtn as HTMLButtonElement", () => {
      expect(domManager.clearBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports exampleSelect as HTMLSelectElement", () => {
      expect(domManager.exampleSelect).toBeInstanceOf(HTMLSelectElement);
    });

    test("exports exportBtn as HTMLButtonElement", () => {
      expect(domManager.exportBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports exportAudioBtn as HTMLButtonElement", () => {
      expect(domManager.exportAudioBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports exportMidiBtn as HTMLButtonElement", () => {
      expect(domManager.exportMidiBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports saveGenomeBtn as HTMLButtonElement", () => {
      expect(domManager.saveGenomeBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports loadGenomeBtn as HTMLButtonElement", () => {
      expect(domManager.loadGenomeBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports exportStudentProgressBtn as HTMLButtonElement", () => {
      expect(domManager.exportStudentProgressBtn).toBeInstanceOf(
        HTMLButtonElement,
      );
    });

    test("exports genomeFileInput as HTMLInputElement", () => {
      expect(domManager.genomeFileInput).toBeInstanceOf(HTMLInputElement);
    });

    test("exports statusMessage as HTMLSpanElement", () => {
      expect(domManager.statusMessage).toBeInstanceOf(HTMLSpanElement);
    });

    test("exports codonCount as HTMLSpanElement", () => {
      expect(domManager.codonCount).toBeInstanceOf(HTMLSpanElement);
    });

    test("exports instructionCount as HTMLSpanElement", () => {
      expect(domManager.instructionCount).toBeInstanceOf(HTMLSpanElement);
    });

    test("exports statusBar as HTMLDivElement", () => {
      expect(domManager.statusBar).toBeInstanceOf(HTMLDivElement);
    });
  });

  // Mutation Button Exports
  describe("mutation button exports", () => {
    test("exports silentMutationBtn as HTMLButtonElement", () => {
      expect(domManager.silentMutationBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports missenseMutationBtn as HTMLButtonElement", () => {
      expect(domManager.missenseMutationBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports nonsenseMutationBtn as HTMLButtonElement", () => {
      expect(domManager.nonsenseMutationBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports frameshiftMutationBtn as HTMLButtonElement", () => {
      expect(domManager.frameshiftMutationBtn).toBeInstanceOf(
        HTMLButtonElement,
      );
    });

    test("exports pointMutationBtn as HTMLButtonElement", () => {
      expect(domManager.pointMutationBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports insertionMutationBtn as HTMLButtonElement", () => {
      expect(domManager.insertionMutationBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports deletionMutationBtn as HTMLButtonElement", () => {
      expect(domManager.deletionMutationBtn).toBeInstanceOf(HTMLButtonElement);
    });
  });

  // Panel Exports
  describe("panel exports", () => {
    test("exports shareContainer as HTMLDivElement", () => {
      expect(domManager.shareContainer).toBeInstanceOf(HTMLDivElement);
    });

    test("exports difficultyFilter as HTMLSelectElement", () => {
      expect(domManager.difficultyFilter).toBeInstanceOf(HTMLSelectElement);
    });

    test("exports conceptFilter as HTMLSelectElement", () => {
      expect(domManager.conceptFilter).toBeInstanceOf(HTMLSelectElement);
    });

    test("exports searchInput as HTMLInputElement", () => {
      expect(domManager.searchInput).toBeInstanceOf(HTMLInputElement);
    });

    test("exports exampleInfo as HTMLDivElement", () => {
      expect(domManager.exampleInfo).toBeInstanceOf(HTMLDivElement);
    });

    test("exports linterPanel as HTMLDivElement", () => {
      expect(domManager.linterPanel).toBeInstanceOf(HTMLDivElement);
    });

    test("exports linterToggle as HTMLButtonElement", () => {
      expect(domManager.linterToggle).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports linterMessages as HTMLDivElement", () => {
      expect(domManager.linterMessages).toBeInstanceOf(HTMLDivElement);
    });

    test("exports fixAllBtn as HTMLButtonElement", () => {
      expect(domManager.fixAllBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports diffViewerPanel as HTMLDivElement", () => {
      expect(domManager.diffViewerPanel).toBeInstanceOf(HTMLDivElement);
    });

    test("exports diffViewerToggle as HTMLButtonElement", () => {
      expect(domManager.diffViewerToggle).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports diffViewerClearBtn as HTMLButtonElement", () => {
      expect(domManager.diffViewerClearBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports diffViewerContainer as HTMLDivElement", () => {
      expect(domManager.diffViewerContainer).toBeInstanceOf(HTMLDivElement);
    });

    test("exports analyzeBtn as HTMLButtonElement", () => {
      expect(domManager.analyzeBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports analyzerPanel as HTMLDivElement", () => {
      expect(domManager.analyzerPanel).toBeInstanceOf(HTMLDivElement);
    });

    test("exports analyzerToggle as HTMLButtonElement", () => {
      expect(domManager.analyzerToggle).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports analyzerContent as HTMLDivElement", () => {
      expect(domManager.analyzerContent).toBeInstanceOf(HTMLDivElement);
    });
  });

  // Audio and Timeline Exports
  describe("audio and timeline exports", () => {
    test("exports audioToggleBtn as HTMLButtonElement", () => {
      expect(domManager.audioToggleBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports timelineToggleBtn as HTMLButtonElement", () => {
      expect(domManager.timelineToggleBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports timelinePanel as HTMLDivElement", () => {
      expect(domManager.timelinePanel).toBeInstanceOf(HTMLDivElement);
    });

    test("exports timelineContainer as HTMLDivElement", () => {
      expect(domManager.timelineContainer).toBeInstanceOf(HTMLDivElement);
    });
  });

  // Theme and Mode Exports
  describe("theme and mode exports", () => {
    test("exports themeToggleBtn as HTMLButtonElement", () => {
      expect(domManager.themeToggleBtn).toBeInstanceOf(HTMLButtonElement);
    });

    test("exports modeToggleBtns as array", () => {
      expect(Array.isArray(domManager.modeToggleBtns)).toBe(true);
    });

    test("exports playgroundContainer as HTMLDivElement", () => {
      expect(domManager.playgroundContainer).toBeInstanceOf(HTMLDivElement);
    });

    test("exports assessmentContainer as HTMLDivElement", () => {
      expect(domManager.assessmentContainer).toBeInstanceOf(HTMLDivElement);
    });
  });

  // setCompareBtn
  describe("setCompareBtn", () => {
    test("sets compareBtn to provided button element", () => {
      const mockBtn = document.createElement("button");
      domManager.setCompareBtn(mockBtn);
      expect(domManager.compareBtn).toBe(mockBtn);
    });

    test("allows subsequent access to compareBtn export", () => {
      const mockBtn = document.createElement("button");
      mockBtn.id = "compareBtn";
      domManager.setCompareBtn(mockBtn);
      expect(domManager.compareBtn.id).toBe("compareBtn");
    });
  });
});
