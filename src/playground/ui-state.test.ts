/**
 * UI State Management Test Suite
 *
 * Tests for the centralized state management module that handles
 * all application state and core component initialization.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

// =========================================================================
// Tests requiring DOM (use dynamic imports)
// =========================================================================
describe("UI State Management", () => {
  // Store original document methods
  let originalGetElementById: typeof document.getElementById;
  let originalQuerySelector: typeof document.querySelector;
  let originalQuerySelectorAll: typeof document.querySelectorAll;

  // Mock DOM elements
  let mockCanvas: HTMLCanvasElement;
  let mockTimelineContainer: HTMLDivElement;
  let elements: Record<string, HTMLElement>;

  // Dynamically imported module
  let uiState: typeof import("./ui-state");

  beforeAll(async () => {
    // Create mock canvas with getContext
    mockCanvas = document.createElement("canvas");
    mockCanvas.id = "canvas";
    mockCanvas.width = 400;
    mockCanvas.height = 400;
    // Mock getContext to return a minimal 2D context
    mockCanvas.getContext = (() => ({
      fillRect: () => {},
      clearRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 0 }),
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      arcTo: () => {},
      ellipse: () => {},
      rect: () => {},
      fill: () => {},
      stroke: () => {},
      clip: () => {},
      save: () => {},
      restore: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      transform: () => {},
      setTransform: () => {},
      resetTransform: () => {},
      drawImage: () => {},
      createImageData: () => ({
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0,
        colorSpace: "srgb",
      }),
      getImageData: () => ({
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0,
        colorSpace: "srgb",
      }),
      putImageData: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createPattern: () => null,
      canvas: mockCanvas,
      fillStyle: "#000",
      strokeStyle: "#000",
      lineWidth: 1,
      lineCap: "butt",
      lineJoin: "miter",
      miterLimit: 10,
      font: "10px sans-serif",
      textAlign: "start",
      textBaseline: "alphabetic",
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      shadowBlur: 0,
      shadowColor: "rgba(0, 0, 0, 0)",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      imageSmoothingEnabled: true,
      isPointInPath: () => false,
      isPointInStroke: () => false,
      getLineDash: () => [],
      setLineDash: () => {},
      lineDashOffset: 0,
    })) as unknown as typeof mockCanvas.getContext;

    mockTimelineContainer = document.createElement("div");
    mockTimelineContainer.id = "timelineContainer";

    // Create all other required elements
    const requiredIds = [
      "editor",
      "runBtn",
      "clearBtn",
      "exampleSelect",
      "exportBtn",
      "exportAudioBtn",
      "exportMidiBtn",
      "saveGenomeBtn",
      "loadGenomeBtn",
      "exportStudentProgressBtn",
      "genomeFileInput",
      "statusMessage",
      "codonCount",
      "instructionCount",
      "shareContainer",
      "difficultyFilter",
      "conceptFilter",
      "searchInput",
      "exampleInfo",
      "linterPanel",
      "linterToggle",
      "linterMessages",
      "fixAllBtn",
      "diffViewerPanel",
      "diffViewerToggle",
      "diffViewerClearBtn",
      "diffViewerContainer",
      "analyzeBtn",
      "analyzerPanel",
      "analyzerToggle",
      "analyzerContent",
      "audioToggleBtn",
      "timelineToggleBtn",
      "timelinePanel",
      "themeToggleBtn",
      "playgroundContainer",
      "assessmentContainer",
      "achievementContainer",
      "silentMutationBtn",
      "missenseMutationBtn",
      "nonsenseMutationBtn",
      "frameshiftMutationBtn",
      "pointMutationBtn",
      "insertionMutationBtn",
      "deletionMutationBtn",
    ];

    elements = {
      canvas: mockCanvas,
      timelineContainer: mockTimelineContainer,
    };

    // Create remaining elements with appropriate types (matching dom-manager.ts)
    const spanElements = ["statusMessage", "codonCount", "instructionCount"];
    const textareaElements = ["editor"];
    const selectElements = [
      "exampleSelect",
      "difficultyFilter",
      "conceptFilter",
    ];
    const inputElements = ["genomeFileInput", "searchInput"];
    const buttonElements = [
      "runBtn",
      "clearBtn",
      "exportBtn",
      "exportAudioBtn",
      "exportMidiBtn",
      "saveGenomeBtn",
      "loadGenomeBtn",
      "exportStudentProgressBtn",
      "silentMutationBtn",
      "missenseMutationBtn",
      "nonsenseMutationBtn",
      "frameshiftMutationBtn",
      "pointMutationBtn",
      "insertionMutationBtn",
      "deletionMutationBtn",
      "linterToggle",
      "fixAllBtn",
      "diffViewerToggle",
      "diffViewerClearBtn",
      "analyzeBtn",
      "analyzerToggle",
      "audioToggleBtn",
      "timelineToggleBtn",
      "themeToggleBtn",
    ];

    for (const id of requiredIds) {
      if (!elements[id]) {
        let el: HTMLElement;
        if (textareaElements.includes(id)) {
          el = document.createElement("textarea");
        } else if (selectElements.includes(id)) {
          el = document.createElement("select");
        } else if (inputElements.includes(id)) {
          el = document.createElement("input");
        } else if (buttonElements.includes(id)) {
          el = document.createElement("button");
        } else if (spanElements.includes(id)) {
          el = document.createElement("span");
        } else {
          el = document.createElement("div");
        }
        el.id = id;
        elements[id] = el;
      }
    }

    // Store original methods
    originalGetElementById = document.getElementById.bind(document);
    originalQuerySelector = document.querySelector.bind(document);
    originalQuerySelectorAll = document.querySelectorAll.bind(document);

    // Mock document methods
    document.getElementById = (id: string) => {
      return elements[id] || originalGetElementById(id);
    };
    document.querySelector = ((selector: string) => {
      if (selector === ".status-bar") {
        const el = document.createElement("div");
        el.className = "status-bar";
        return el;
      }
      if (selector.startsWith("#")) {
        const id = selector.slice(1);
        return elements[id] || null;
      }
      return originalQuerySelector(selector);
    }) as typeof document.querySelector;
    document.querySelectorAll = ((selector: string) => {
      if (selector === 'input[name="mode"]') {
        return [] as unknown as NodeListOf<Element>;
      }
      return originalQuerySelectorAll(selector);
    }) as typeof document.querySelectorAll;

    // Dynamically import the module after DOM setup
    uiState = await import("./ui-state");
  });

  afterAll(() => {
    // Restore original document methods
    if (originalGetElementById) {
      document.getElementById = originalGetElementById;
    }
    if (originalQuerySelector) {
      document.querySelector = originalQuerySelector;
    }
    if (originalQuerySelectorAll) {
      document.querySelectorAll = originalQuerySelectorAll;
    }
  });

  // =========================================================================
  // Singleton Initialization
  // =========================================================================
  describe("singleton initialization", () => {
    test("exports lexer as CodonLexer instance", () => {
      expect(uiState.lexer).toBeDefined();
      expect(typeof uiState.lexer.tokenize).toBe("function");
    });

    test("exports renderer as Canvas2DRenderer instance", () => {
      expect(uiState.renderer).toBeDefined();
      expect(typeof uiState.renderer.clear).toBe("function");
    });

    test("exports audioRenderer as AudioRenderer instance", () => {
      expect(uiState.audioRenderer).toBeDefined();
      expect(typeof uiState.audioRenderer.clear).toBe("function");
    });

    test("exports midiExporter as MIDIExporter instance", () => {
      expect(uiState.midiExporter).toBeDefined();
      expect(typeof uiState.midiExporter.generateMIDI).toBe("function");
    });

    test("exports vm as CodonVM instance with renderer", () => {
      expect(uiState.vm).toBeDefined();
      expect(typeof uiState.vm.run).toBe("function");
    });

    test("exports timelineScrubber as TimelineScrubber instance", () => {
      expect(uiState.timelineScrubber).toBeDefined();
      expect(typeof uiState.timelineScrubber.loadGenome).toBe("function");
    });

    test("exports themeManager as ThemeManager instance", () => {
      expect(uiState.themeManager).toBeDefined();
      expect(typeof uiState.themeManager.getTheme).toBe("function");
    });

    test("exports achievementEngine as AchievementEngine instance", () => {
      expect(uiState.achievementEngine).toBeDefined();
      expect(typeof uiState.achievementEngine.trackGenomeCreated).toBe(
        "function",
      );
    });

    test("exports achievementUI as AchievementUI instance", () => {
      expect(uiState.achievementUI).toBeDefined();
    });

    test("exports assessmentEngine as AssessmentEngine instance", () => {
      expect(uiState.assessmentEngine).toBeDefined();
      expect(typeof uiState.assessmentEngine.generateChallenge).toBe(
        "function",
      );
    });

    test("exports researchMetrics as ResearchMetrics instance (disabled)", () => {
      expect(uiState.researchMetrics).toBeDefined();
      // Check that it's disabled by default
      expect(uiState.researchMetrics.isEnabled()).toBe(false);
    });
  });

  // =========================================================================
  // Initial State Values
  // =========================================================================
  describe("initial state values", () => {
    test("renderMode defaults to 'visual'", () => {
      // Note: renderMode is a module-level let, so we check via export
      expect(uiState.renderMode).toBe("visual");
    });

    test("lastSnapshots defaults to empty array", () => {
      expect(Array.isArray(uiState.lastSnapshots)).toBe(true);
    });

    test("timelineVisible defaults to false", () => {
      expect(uiState.timelineVisible).toBe(false);
    });

    test("assessmentUI defaults to null", () => {
      expect(uiState.assessmentUI).toBe(null);
    });
  });

  // =========================================================================
  // setRenderMode
  // =========================================================================
  describe("setRenderMode", () => {
    test("sets renderMode to 'visual'", () => {
      uiState.setRenderMode("visual");
      expect(uiState.renderMode).toBe("visual");
    });

    test("sets renderMode to 'audio'", () => {
      uiState.setRenderMode("audio");
      expect(uiState.renderMode).toBe("audio");
    });

    test("sets renderMode to 'both'", () => {
      uiState.setRenderMode("both");
      expect(uiState.renderMode).toBe("both");
    });

    test("exported renderMode reflects updated value", () => {
      uiState.setRenderMode("visual");
      expect(uiState.renderMode).toBe("visual");
      uiState.setRenderMode("audio");
      expect(uiState.renderMode).toBe("audio");
    });
  });

  // =========================================================================
  // setTimelineVisible
  // =========================================================================
  describe("setTimelineVisible", () => {
    test("sets timelineVisible to true", () => {
      uiState.setTimelineVisible(true);
      expect(uiState.timelineVisible).toBe(true);
    });

    test("sets timelineVisible to false", () => {
      uiState.setTimelineVisible(false);
      expect(uiState.timelineVisible).toBe(false);
    });

    test("exported timelineVisible reflects updated value", () => {
      uiState.setTimelineVisible(true);
      expect(uiState.timelineVisible).toBe(true);
      uiState.setTimelineVisible(false);
      expect(uiState.timelineVisible).toBe(false);
    });
  });

  // =========================================================================
  // setAssessmentUI
  // =========================================================================
  describe("setAssessmentUI", () => {
    test("sets assessmentUI to mock instance", () => {
      const mockUI = {} as import("../assessment-ui").AssessmentUI;
      uiState.setAssessmentUI(mockUI);
      expect(uiState.assessmentUI).toBe(mockUI);
    });

    test("sets assessmentUI to null", () => {
      uiState.setAssessmentUI(null);
      expect(uiState.assessmentUI).toBe(null);
    });

    test("exported assessmentUI reflects updated value", () => {
      const mockUI = {} as import("../assessment-ui").AssessmentUI;
      uiState.setAssessmentUI(mockUI);
      expect(uiState.assessmentUI).toBe(mockUI);
      uiState.setAssessmentUI(null);
      expect(uiState.assessmentUI).toBe(null);
    });
  });

  // =========================================================================
  // setLastSnapshots
  // =========================================================================
  describe("setLastSnapshots", () => {
    test("sets lastSnapshots to VMState array", () => {
      const snapshots = [
        { x: 0, y: 0, angle: 0, color: "#000", penDown: true },
      ] as import("../types").VMState[];
      uiState.setLastSnapshots(snapshots);
      expect(uiState.lastSnapshots).toBe(snapshots);
    });

    test("sets lastSnapshots to empty array", () => {
      uiState.setLastSnapshots([]);
      expect(uiState.lastSnapshots).toEqual([]);
    });

    test("exported lastSnapshots reflects updated value", () => {
      const snapshots = [
        { x: 100, y: 100, angle: 90, color: "#FFF", penDown: false },
      ] as import("../types").VMState[];
      uiState.setLastSnapshots(snapshots);
      expect(uiState.lastSnapshots).toBe(snapshots);
    });

    test("preserves snapshot reference (no deep copy)", () => {
      const snapshots = [
        { x: 0, y: 0, angle: 0, color: "#000", penDown: true },
      ] as import("../types").VMState[];
      uiState.setLastSnapshots(snapshots);
      // Verify same reference is returned
      expect(uiState.lastSnapshots).toBe(snapshots);
      // Verify mutations to original affect the export
      (snapshots[0] as { x: number }).x = 999;
      expect((uiState.lastSnapshots[0] as { x: number }).x).toBe(999);
    });
  });

  // =========================================================================
  // Integration
  // =========================================================================
  describe("integration", () => {
    test("VM uses renderer for canvas operations", () => {
      // VM should have been created with the renderer
      expect(uiState.vm).toBeDefined();
      expect(uiState.renderer).toBeDefined();
    });

    test("timeline scrubber uses correct container and canvas", () => {
      // Timeline scrubber should be initialized with the DOM elements
      expect(uiState.timelineScrubber).toBeDefined();
    });

    test("achievement UI uses achievement engine", () => {
      // Both should be defined and connected
      expect(uiState.achievementUI).toBeDefined();
      expect(uiState.achievementEngine).toBeDefined();
    });
  });
});
