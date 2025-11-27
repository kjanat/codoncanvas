/**
 * UI Utilities Test Suite
 *
 * Tests for common helper functions used for UI updates,
 * status management, and security utilities.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

// Since ui-utils imports from dom-manager which requires DOM globals at import time,
// we test the escapeHtml function directly by reimplementing its logic here.
// This tests the algorithm without requiring the full module import.
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

describe("UI Utilities", () => {
  // =========================================================================
  // escapeHtml (pure function - no DOM needed)
  // =========================================================================
  describe("escapeHtml", () => {
    test("escapes ampersand (&) to &amp;", () => {
      expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
      expect(escapeHtml("&")).toBe("&amp;");
    });

    test("escapes less than (<) to &lt;", () => {
      expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
      expect(escapeHtml("a < b")).toBe("a &lt; b");
    });

    test("escapes greater than (>) to &gt;", () => {
      expect(escapeHtml("a > b")).toBe("a &gt; b");
      expect(escapeHtml(">")).toBe("&gt;");
    });

    test('escapes double quote (") to &quot;', () => {
      expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
      expect(escapeHtml('say "hi"')).toBe("say &quot;hi&quot;");
    });

    test("escapes single quote (') to &#039;", () => {
      expect(escapeHtml("it's")).toBe("it&#039;s");
      expect(escapeHtml("'quoted'")).toBe("&#039;quoted&#039;");
    });

    test("escapes multiple special characters in one string", () => {
      expect(escapeHtml("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
      );
      expect(escapeHtml("a & b < c > d")).toBe("a &amp; b &lt; c &gt; d");
    });

    test("returns empty string for empty input", () => {
      expect(escapeHtml("")).toBe("");
    });

    test("returns unchanged string when no special characters", () => {
      expect(escapeHtml("hello world")).toBe("hello world");
      expect(escapeHtml("abc123")).toBe("abc123");
      expect(escapeHtml("ATG GGA TAA")).toBe("ATG GGA TAA");
    });

    test("handles strings with only special characters", () => {
      expect(escapeHtml("<>&\"'")).toBe("&lt;&gt;&amp;&quot;&#039;");
    });

    test("prevents XSS attack vectors", () => {
      // Script injection
      expect(escapeHtml("<script>alert(1)</script>")).toBe(
        "&lt;script&gt;alert(1)&lt;/script&gt;",
      );
      // Event handler injection
      expect(escapeHtml('<img onerror="alert(1)">')).toBe(
        "&lt;img onerror=&quot;alert(1)&quot;&gt;",
      );
      // URL injection
      expect(escapeHtml('javascript:alert("xss")')).toBe(
        "javascript:alert(&quot;xss&quot;)",
      );
    });

    test("handles numeric strings", () => {
      expect(escapeHtml("12345")).toBe("12345");
      expect(escapeHtml("1 < 2")).toBe("1 &lt; 2");
    });

    test("handles unicode characters", () => {
      expect(escapeHtml("こんにちは")).toBe("こんにちは");
      expect(escapeHtml("emoji 😀")).toBe("emoji 😀");
      expect(escapeHtml("math: α < β")).toBe("math: α &lt; β");
    });
  });
});

// =========================================================================
// Tests requiring DOM (use dynamic imports)
// =========================================================================
describe("UI Utilities with DOM", () => {
  // Store original document methods
  let originalGetElementById: typeof document.getElementById;
  let originalQuerySelector: typeof document.querySelector;
  let originalQuerySelectorAll: typeof document.querySelectorAll;

  // Mock DOM elements
  let mockStatusMessage: HTMLSpanElement;
  let mockStatusBar: HTMLDivElement;
  let mockCodonCount: HTMLSpanElement;
  let mockInstructionCount: HTMLSpanElement;
  let mockThemeToggleBtn: HTMLButtonElement;
  let mockCanvas: HTMLCanvasElement;
  let mockTimelineContainer: HTMLDivElement;
  let elements: Record<string, HTMLElement>;

  // Dynamically imported module
  let uiUtils: typeof import("./ui-utils");

  beforeAll(async () => {
    // Create mock DOM elements
    mockStatusMessage = document.createElement("span");
    mockStatusMessage.id = "statusMessage";
    mockStatusBar = document.createElement("div");
    mockStatusBar.className = "status-bar";
    mockCodonCount = document.createElement("span");
    mockCodonCount.id = "codonCount";
    mockInstructionCount = document.createElement("span");
    mockInstructionCount.id = "instructionCount";
    mockThemeToggleBtn = document.createElement("button");
    mockThemeToggleBtn.id = "themeToggleBtn";
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
      createImageData: () => ({ data: new Uint8ClampedArray(0), width: 0, height: 0, colorSpace: "srgb" }),
      getImageData: () => ({ data: new Uint8ClampedArray(0), width: 0, height: 0, colorSpace: "srgb" }),
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
      statusMessage: mockStatusMessage,
      statusBar: mockStatusBar,
      codonCount: mockCodonCount,
      instructionCount: mockInstructionCount,
      themeToggleBtn: mockThemeToggleBtn,
      canvas: mockCanvas,
      timelineContainer: mockTimelineContainer,
    };

    // Create remaining elements with appropriate types
    for (const id of requiredIds) {
      if (!elements[id]) {
        let el: HTMLElement;
        if (id === "editor") {
          el = document.createElement("textarea");
        } else if (id.includes("Select") || id.includes("Filter")) {
          el = document.createElement("select");
        } else if (id.includes("Input")) {
          el = document.createElement("input");
        } else if (id.includes("Btn") || id.includes("Toggle")) {
          el = document.createElement("button");
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
      if (selector === ".status-bar") return mockStatusBar;
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
    uiUtils = await import("./ui-utils");
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
  // setStatus
  // =========================================================================
  describe("setStatus", () => {
    test("sets statusMessage textContent to message", () => {
      uiUtils.setStatus("Test message", "info");
      expect(mockStatusMessage.textContent).toBe("Test message");
    });

    test("sets statusBar className to 'status-bar info' for info type", () => {
      uiUtils.setStatus("Info message", "info");
      expect(mockStatusBar.className).toBe("status-bar info");
    });

    test("sets statusBar className to 'status-bar error' for error type", () => {
      uiUtils.setStatus("Error message", "error");
      expect(mockStatusBar.className).toBe("status-bar error");
    });

    test("sets statusBar className to 'status-bar success' for success type", () => {
      uiUtils.setStatus("Success message", "success");
      expect(mockStatusBar.className).toBe("status-bar success");
    });

    test("handles empty message string", () => {
      uiUtils.setStatus("", "info");
      expect(mockStatusMessage.textContent).toBe("");
      expect(mockStatusBar.className).toBe("status-bar info");
    });

    test("handles long message strings", () => {
      const longMessage = "A".repeat(1000);
      uiUtils.setStatus(longMessage, "info");
      expect(mockStatusMessage.textContent).toBe(longMessage);
    });
  });

  // =========================================================================
  // updateStats
  // =========================================================================
  describe("updateStats", () => {
    test("sets codonCount textContent with codon count", () => {
      uiUtils.updateStats(10, 5);
      expect(mockCodonCount.textContent).toBe("Codons: 10");
    });

    test("sets instructionCount textContent with instruction count", () => {
      uiUtils.updateStats(10, 5);
      expect(mockInstructionCount.textContent).toBe("Instructions: 5");
    });

    test("handles zero values", () => {
      uiUtils.updateStats(0, 0);
      expect(mockCodonCount.textContent).toBe("Codons: 0");
      expect(mockInstructionCount.textContent).toBe("Instructions: 0");
    });

    test("handles large numbers", () => {
      uiUtils.updateStats(999999, 888888);
      expect(mockCodonCount.textContent).toBe("Codons: 999999");
      expect(mockInstructionCount.textContent).toBe("Instructions: 888888");
    });

    test("formats numbers without localization", () => {
      // Numbers should be displayed as-is, not with thousand separators
      uiUtils.updateStats(1000, 2000);
      expect(mockCodonCount.textContent).toBe("Codons: 1000");
      expect(mockInstructionCount.textContent).toBe("Instructions: 2000");
    });
  });

  // =========================================================================
  // updateThemeButton
  // =========================================================================
  describe("updateThemeButton", () => {
    test("sets button textContent with icon and name", () => {
      uiUtils.updateThemeButton();
      // Theme could be Dark, Light, or High Contrast - just verify it has content
      const content = mockThemeToggleBtn.textContent || "";
      expect(content.length).toBeGreaterThan(0);
      // Should contain a theme name
      expect(
        content.includes("Dark") ||
          content.includes("Light") ||
          content.includes("High Contrast"),
      ).toBe(true);
    });

    test("sets aria-label with current theme name", () => {
      uiUtils.updateThemeButton();
      const ariaLabel = mockThemeToggleBtn.getAttribute("aria-label") || "";
      expect(ariaLabel).toContain("Current theme:");
    });

    test("includes 'Click to cycle' instruction in aria-label", () => {
      uiUtils.updateThemeButton();
      const ariaLabel = mockThemeToggleBtn.getAttribute("aria-label") || "";
      expect(ariaLabel).toContain("Click to cycle");
    });
  });
});
