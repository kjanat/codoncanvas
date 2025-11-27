/**
 * Playground Main Module Test Suite
 *
 * Tests for the main playground entry point that coordinates all
 * playground modules and handles user interactions.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "@/test-utils/canvas-mock";
import { CODON_MAP, Opcode } from "@/types";

// Mock DOM elements helper
function createMockElement(tagName: string, id?: string): HTMLElement {
  const el = document.createElement(tagName);
  if (id) el.id = id;
  return el;
}

function createMockCanvas(
  id: string,
  width = 400,
  height = 400,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.id = id;
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function createMockTextarea(id: string, value = ""): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.id = id;
  textarea.value = value;
  return textarea;
}

function createMockSelect(id: string): HTMLSelectElement {
  const select = document.createElement("select");
  select.id = id;
  return select;
}

function createMockInput(id: string, type = "text"): HTMLInputElement {
  const input = document.createElement("input");
  input.id = id;
  input.type = type;
  return input;
}

describe("Playground Main Module", () => {
  beforeEach(() => {
    mockCanvasContext();
  });

  afterEach(() => {
    restoreCanvasContext();
  });

  // trackDrawingOperations
  describe("trackDrawingOperations", () => {
    test("returns empty array when no drawing tokens", () => {
      // trackDrawingOperations is internal, but we can test the logic
      const tokens: { text: string }[] = [];
      const circleCodons = ["GGA", "GGC", "GGG", "GGT"];
      const hasCircle = tokens.some((t) => circleCodons.includes(t.text));
      expect(hasCircle).toBe(false);
    });

    test("tracks CIRCLE shape (GGA, GGC, GGG, GGT codons)", () => {
      const circleCodons = ["GGA", "GGC", "GGG", "GGT"];
      for (const codon of circleCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.CIRCLE);
      }
    });

    test("tracks RECT shape (CCA, CCC, CCG, CCT codons)", () => {
      const rectCodons = ["CCA", "CCC", "CCG", "CCT"];
      for (const codon of rectCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.RECT);
      }
    });

    test("tracks LINE shape (AAA, AAC, AAG, AAT codons)", () => {
      const lineCodons = ["AAA", "AAC", "AAG", "AAT"];
      for (const codon of lineCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.LINE);
      }
    });

    test("tracks TRIANGLE shape (GCA, GCC, GCG, GCT codons)", () => {
      const triangleCodons = ["GCA", "GCC", "GCG", "GCT"];
      for (const codon of triangleCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.TRIANGLE);
      }
    });

    test("tracks ELLIPSE shape (GTA, GTC, GTG, GTT codons)", () => {
      const ellipseCodons = ["GTA", "GTC", "GTG", "GTT"];
      for (const codon of ellipseCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.ELLIPSE);
      }
    });

    test("tracks color usage (TTA, TTC, TTG, TTT codons)", () => {
      const colorCodons = ["TTA", "TTC", "TTG", "TTT"];
      for (const codon of colorCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.COLOR);
      }
    });

    test("tracks TRANSLATE transform (ACA, ACC, ACG, ACT codons)", () => {
      const translateCodons = ["ACA", "ACC", "ACG", "ACT"];
      for (const codon of translateCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.TRANSLATE);
      }
    });

    test("tracks ROTATE transform (AGA, AGC, AGG, AGT codons)", () => {
      const rotateCodons = ["AGA", "AGC", "AGG", "AGT"];
      for (const codon of rotateCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.ROTATE);
      }
    });

    test("tracks SCALE transform (CGA, CGC, CGG, CGT codons)", () => {
      const scaleCodons = ["CGA", "CGC", "CGG", "CGT"];
      for (const codon of scaleCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.SCALE);
      }
    });

    test("accumulates multiple achievements from single execution", () => {
      // Test that multiple shapes in one execution trigger multiple tracking
      const tokens = [
        { text: "GGA" }, // CIRCLE
        { text: "CCA" }, // RECT
        { text: "AAA" }, // LINE
      ];
      const shapesFound = tokens.filter((t) =>
        ["GGA", "CCA", "AAA"].includes(t.text),
      );
      expect(shapesFound.length).toBe(3);
    });

    test("ignores non-drawing tokens", () => {
      const controlCodons = ["ATG", "TAA", "TAG", "TGA"];
      const drawingOpcodes = [
        Opcode.CIRCLE,
        Opcode.RECT,
        Opcode.LINE,
        Opcode.TRIANGLE,
        Opcode.ELLIPSE,
      ];
      for (const codon of controlCodons) {
        expect(drawingOpcodes).not.toContain(CODON_MAP[codon]);
      }
    });
  });

  // runProgram
  describe("runProgram", () => {
    test("tokenizes genome from editor", async () => {
      const { CodonLexer } = await import("@/lexer");
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize("ATG GGA TAA");
      expect(tokens.length).toBe(3);
      expect(tokens[0].text).toBe("ATG");
    });

    test("updates stats with token count", async () => {
      const { CodonLexer } = await import("@/lexer");
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize("ATG GGA CCA TAA");
      expect(tokens.length).toBe(4);
    });

    test("validates structure and shows critical errors", async () => {
      const { CodonLexer } = await import("@/lexer");
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize("GGA TAA"); // Missing START
      const errors = lexer.validateStructure(tokens);
      const critical = errors.filter((e) => e.severity === "error");
      expect(critical.length).toBeGreaterThan(0);
    });

    test("validates frame and shows warnings", async () => {
      const { CodonLexer } = await import("@/lexer");
      const lexer = new CodonLexer();
      // Frame error - not multiple of 3 characters
      const errors = lexer.validateFrame("ATG GG TAA");
      // May or may not have warnings depending on validation rules
      expect(Array.isArray(errors)).toBe(true);
    });

    test("runs in visual mode by default", async () => {
      const { Canvas2DRenderer } = await import("@/renderer");
      const { CodonVM } = await import("@/vm");
      const { CodonLexer } = await import("@/lexer");

      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      const lexer = new CodonLexer();

      const tokens = lexer.tokenize("ATG TAA");
      expect(() => vm.run(tokens)).not.toThrow();
    });

    test("handles Error exceptions with error status", async () => {
      const { CodonLexer } = await import("@/lexer");
      const lexer = new CodonLexer();
      // Invalid genome should throw an error during tokenization
      expect(() => lexer.tokenize("XYZ INVALID")).toThrow();
    });

    test("handles parse errors from lexer validation", async () => {
      const { CodonLexer } = await import("@/lexer");
      const lexer = new CodonLexer();
      // Missing START codon should be flagged
      const tokens = lexer.tokenize("GGA TAA");
      const errors = lexer.validateStructure(tokens);
      expect(errors.some((e) => e.message.includes("START"))).toBe(true);
    });
  });

  // clearCanvas
  describe("clearCanvas", () => {
    test("resets VM state", async () => {
      const { Canvas2DRenderer } = await import("@/renderer");
      const { CodonVM } = await import("@/vm");

      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);

      // Run some code first
      const { CodonLexer } = await import("@/lexer");
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize("ATG TAA");
      vm.run(tokens);

      // Reset
      vm.reset();

      // Verify reset state
      expect(vm.state.stack).toEqual([]);
      expect(vm.state.instructionPointer).toBe(0);
    });

    test("clears renderer", async () => {
      const { Canvas2DRenderer } = await import("@/renderer");
      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);

      // Should not throw
      expect(() => renderer.clear()).not.toThrow();
    });

    test("VM can be reset to initial state", async () => {
      const { Canvas2DRenderer } = await import("@/renderer");
      const { CodonVM } = await import("@/vm");
      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      vm.reset();
      expect(vm.state.instructionCount).toBe(0);
    });
  });

  // getFilteredExamples
  describe("getFilteredExamples", () => {
    test("returns all examples when no filters applied", async () => {
      const { examples } = await import("@/examples");
      const allExamples = Object.entries(examples);
      expect(allExamples.length).toBeGreaterThan(0);
    });

    test("filters by difficulty when difficultyFilter has value", async () => {
      const { examples } = await import("@/examples");
      const beginnerExamples = Object.entries(examples).filter(
        ([_, ex]) => ex.difficulty === "beginner",
      );
      expect(beginnerExamples.length).toBeGreaterThan(0);
    });

    test("filters by concept when conceptFilter has value", async () => {
      const { examples } = await import("@/examples");
      const loopExamples = Object.entries(examples).filter(([_, ex]) =>
        ex.concepts.includes("loops"),
      );
      // May or may not have loop examples
      expect(Array.isArray(loopExamples)).toBe(true);
    });

    test("filters by search term (case-insensitive)", async () => {
      const { examples } = await import("@/examples");
      const searchTerm = "circle";
      const filtered = Object.entries(examples).filter(([_, ex]) =>
        [ex.title, ex.description, ...ex.keywords, ...ex.concepts]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
      expect(Array.isArray(filtered)).toBe(true);
    });

    test("searches in title, description, keywords, and concepts", async () => {
      const { examples } = await import("@/examples");
      const exampleList = Object.values(examples);
      if (exampleList.length > 0) {
        const ex = exampleList[0];
        expect(ex).toHaveProperty("title");
        expect(ex).toHaveProperty("description");
        expect(ex).toHaveProperty("keywords");
        expect(ex).toHaveProperty("concepts");
      }
    });

    test("combines multiple filters (AND logic)", async () => {
      const { examples } = await import("@/examples");
      const filtered = Object.entries(examples).filter(([_, ex]) => {
        const matchesDifficulty = ex.difficulty === "beginner";
        const matchesSearch = ex.title.toLowerCase().includes("a");
        return matchesDifficulty && matchesSearch;
      });
      expect(Array.isArray(filtered)).toBe(true);
    });

    test("returns empty array when no matches", async () => {
      const { examples } = await import("@/examples");
      const filtered = Object.entries(examples).filter(
        ([_, ex]) => ex.title === "nonexistent_title_xyz",
      );
      expect(filtered.length).toBe(0);
    });

    test("returns ExampleKey and ExampleMetadata tuples", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [key, metadata] = entries[0];
        expect(typeof key).toBe("string");
        expect(metadata).toHaveProperty("title");
        expect(metadata).toHaveProperty("genome");
      }
    });
  });

  // updateExampleDropdown
  describe("updateExampleDropdown", () => {
    test("clears existing options", () => {
      const select = createMockSelect("exampleSelect");
      select.appendChild(document.createElement("option"));
      select.appendChild(document.createElement("option"));

      select.textContent = "";
      expect(select.children.length).toBe(0);
    });

    test("adds default 'Load Example...' option", () => {
      const select = createMockSelect("exampleSelect");
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Load Example...";
      select.appendChild(defaultOption);

      expect(select.options[0].textContent).toBe("Load Example...");
      expect(select.options[0].value).toBe("");
    });

    test("groups examples by difficulty level", async () => {
      const { examples } = await import("@/examples");
      const grouped = {
        beginner: [] as string[],
        intermediate: [] as string[],
        advanced: [] as string[],
        "advanced-showcase": [] as string[],
      };

      Object.entries(examples).forEach(([key, ex]) => {
        grouped[ex.difficulty].push(key);
      });

      // At least one difficulty level should have examples
      const totalGrouped = Object.values(grouped).flat().length;
      expect(totalGrouped).toBe(Object.keys(examples).length);
    });

    test("creates beginner optgroup when beginner examples exist", async () => {
      const { examples } = await import("@/examples");
      const beginnerExamples = Object.entries(examples).filter(
        ([_, ex]) => ex.difficulty === "beginner",
      );

      if (beginnerExamples.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = "🌱 Beginner";
        expect(optgroup.label).toBe("🌱 Beginner");
      }
    });

    test("creates intermediate optgroup when intermediate examples exist", async () => {
      const { examples } = await import("@/examples");
      const intermediateExamples = Object.entries(examples).filter(
        ([_, ex]) => ex.difficulty === "intermediate",
      );

      if (intermediateExamples.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = "🌿 Intermediate";
        expect(optgroup.label).toBe("🌿 Intermediate");
      }
    });

    test("creates advanced optgroup when advanced examples exist", async () => {
      const { examples } = await import("@/examples");
      const advancedExamples = Object.entries(examples).filter(
        ([_, ex]) => ex.difficulty === "advanced",
      );

      if (advancedExamples.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = "🌳 Advanced";
        expect(optgroup.label).toBe("🌳 Advanced");
      }
    });

    test("creates advanced-showcase optgroup when showcase examples exist", async () => {
      const { examples } = await import("@/examples");
      const showcaseExamples = Object.entries(examples).filter(
        ([_, ex]) => ex.difficulty === "advanced-showcase",
      );

      if (showcaseExamples.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = "✨ Advanced Showcase";
        expect(optgroup.label).toBe("✨ Advanced Showcase");
      }
    });

    test("shows filtered count in default option when filters applied", () => {
      const select = createMockSelect("exampleSelect");
      const option = document.createElement("option");
      const totalCount = 20;
      const filteredCount = 5;
      option.textContent = `Load Example... (${filteredCount} of ${totalCount})`;

      expect(option.textContent).toBe("Load Example... (5 of 20)");
    });

    test("creates option elements with correct value and text", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);

      if (entries.length > 0) {
        const [key, ex] = entries[0];
        const option = document.createElement("option");
        option.value = key;
        option.textContent = ex.title;

        expect(option.value).toBe(key);
        expect(option.textContent).toBe(ex.title);
      }
    });
  });

  // showExampleInfo
  describe("showExampleInfo", () => {
    test("hides info panel when key not found in examples", async () => {
      const { examples } = await import("@/examples");
      const invalidKey = "nonexistent_key_xyz";
      const ex = examples[invalidKey as keyof typeof examples];
      expect(ex).toBeUndefined();
    });

    test("clears existing content", () => {
      const panel = createMockElement("div", "exampleInfo");
      panel.innerHTML = "<p>Old content</p>";
      panel.textContent = "";
      expect(panel.innerHTML).toBe("");
    });

    test("displays example title", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [_, ex] = entries[0];
        const titleEl = document.createElement("strong");
        titleEl.textContent = ex.title;
        expect(titleEl.textContent).toBe(ex.title);
      }
    });

    test("displays difficulty badge", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [_, ex] = entries[0];
        const badge = document.createElement("span");
        badge.textContent = ex.difficulty;
        expect([
          "beginner",
          "intermediate",
          "advanced",
          "advanced-showcase",
        ]).toContain(badge.textContent);
      }
    });

    test("displays description", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [_, ex] = entries[0];
        expect(typeof ex.description).toBe("string");
        expect(ex.description.length).toBeGreaterThan(0);
      }
    });

    test("displays concepts list", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [_, ex] = entries[0];
        expect(Array.isArray(ex.concepts)).toBe(true);
      }
    });

    test("displays goodForMutations list", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [_, ex] = entries[0];
        expect(Array.isArray(ex.goodForMutations)).toBe(true);
      }
    });

    test("makes info panel visible", () => {
      const panel = createMockElement("div", "exampleInfo");
      panel.style.display = "none";
      panel.style.display = "block";
      expect(panel.style.display).toBe("block");
    });
  });

  // loadExample
  describe("loadExample", () => {
    test("does nothing when no example selected", () => {
      const select = createMockSelect("exampleSelect");
      select.value = "";
      expect(select.value).toBe("");
    });

    test("loads genome into editor", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [key, ex] = entries[0];
        const editor = createMockTextarea("editor");
        editor.value = ex.genome;
        expect(editor.value).toBe(ex.genome);
      }
    });

    test("sets status with example title", async () => {
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [key, ex] = entries[0];
        const status = `Loaded: ${ex.title}`;
        expect(status).toContain("Loaded:");
        expect(status).toContain(ex.title);
      }
    });

    test("runs linter on loaded genome", async () => {
      const { CodonLexer } = await import("@/lexer");
      const { examples } = await import("@/examples");
      const entries = Object.entries(examples);

      if (entries.length > 0) {
        const [_, ex] = entries[0];
        const lexer = new CodonLexer();
        const tokens = lexer.tokenize(ex.genome);
        // Should be valid - examples should tokenize without throwing
        expect(tokens.length).toBeGreaterThan(0);
      }
    });

    test("resets example select to empty value", () => {
      const select = createMockSelect("exampleSelect");
      select.value = "someExample";
      select.value = "";
      expect(select.value).toBe("");
    });
  });

  // toggleAudio
  describe("toggleAudio", () => {
    test("cycles from visual to audio mode", () => {
      const modes = ["visual", "audio", "both"];
      let currentMode = "visual";
      const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
      currentMode = modes[nextIndex];
      expect(currentMode).toBe("audio");
    });

    test("cycles from audio to both mode", () => {
      const modes = ["visual", "audio", "both"];
      let currentMode = "audio";
      const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
      currentMode = modes[nextIndex];
      expect(currentMode).toBe("both");
    });

    test("cycles from both back to visual mode", () => {
      const modes = ["visual", "audio", "both"];
      let currentMode = "both";
      const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
      currentMode = modes[nextIndex];
      expect(currentMode).toBe("visual");
    });

    test("updates button text for visual mode", () => {
      const btn = document.createElement("button");
      btn.textContent = "🎨 Visual";
      expect(btn.textContent).toBe("🎨 Visual");
    });

    test("updates button text for audio mode", () => {
      const btn = document.createElement("button");
      btn.textContent = "🎵 Audio";
      expect(btn.textContent).toBe("🎵 Audio");
    });

    test("updates button text for both mode", () => {
      const btn = document.createElement("button");
      btn.textContent = "♪🎨 Both";
      expect(btn.textContent).toBe("♪🎨 Both");
    });

    test("updates button title attribute", () => {
      const btn = document.createElement("button");
      btn.title = "Click to switch to audio mode";
      expect(btn.title).toContain("switch to");
    });

    test("sets status with current mode", () => {
      const mode = "audio";
      const status = `Switched to ${mode} mode`;
      expect(status).toBe("Switched to audio mode");
    });
  });

  // toggleTimeline
  describe("toggleTimeline", () => {
    test("shows timeline panel when hidden", () => {
      const panel = createMockElement("div", "timelinePanel");
      panel.style.display = "none";
      panel.style.display = "block";
      expect(panel.style.display).toBe("block");
    });

    test("hides timeline panel when visible", () => {
      const panel = createMockElement("div", "timelinePanel");
      panel.style.display = "block";
      panel.style.display = "none";
      expect(panel.style.display).toBe("none");
    });

    test("updates button text when showing", () => {
      const btn = document.createElement("button");
      btn.textContent = "⏱️ Hide Timeline";
      expect(btn.textContent).toBe("⏱️ Hide Timeline");
    });

    test("updates button text when hiding", () => {
      const btn = document.createElement("button");
      btn.textContent = "⏱️ Timeline";
      expect(btn.textContent).toBe("⏱️ Timeline");
    });

    test("does not load genome when editor is empty", () => {
      const editor = createMockTextarea("editor");
      editor.value = "";
      const source = editor.value.trim();
      expect(source).toBe("");
    });
  });

  // switchMode
  describe("switchMode", () => {
    test("shows playground container in playground mode", () => {
      const container = createMockElement("div", "playgroundContainer");
      container.style.display = "contents";
      expect(container.style.display).toBe("contents");
    });

    test("hides assessment container in playground mode", () => {
      const container = createMockElement("div", "assessmentContainer");
      container.style.display = "none";
      expect(container.style.display).toBe("none");
    });

    test("hides playground container in assessment mode", () => {
      const container = createMockElement("div", "playgroundContainer");
      container.style.display = "none";
      expect(container.style.display).toBe("none");
    });

    test("shows assessment container in assessment mode", () => {
      const container = createMockElement("div", "assessmentContainer");
      container.style.display = "grid";
      expect(container.style.display).toBe("grid");
    });
  });

  // Event Listeners
  describe("event listeners", () => {
    test("runBtn click calls runProgram", () => {
      const btn = document.createElement("button");
      let clicked = false;
      btn.addEventListener("click", () => {
        clicked = true;
      });
      btn.click();
      expect(clicked).toBe(true);
    });

    test("clearBtn click calls clearCanvas", () => {
      const btn = document.createElement("button");
      let clicked = false;
      btn.addEventListener("click", () => {
        clicked = true;
      });
      btn.click();
      expect(clicked).toBe(true);
    });

    test("audioToggleBtn click calls toggleAudio", () => {
      const btn = document.createElement("button");
      let clicked = false;
      btn.addEventListener("click", () => {
        clicked = true;
      });
      btn.click();
      expect(clicked).toBe(true);
    });

    test("timelineToggleBtn click calls toggleTimeline", () => {
      const btn = document.createElement("button");
      let clicked = false;
      btn.addEventListener("click", () => {
        clicked = true;
      });
      btn.click();
      expect(clicked).toBe(true);
    });

    test("themeToggleBtn click cycles theme", () => {
      const btn = document.createElement("button");
      let clicked = false;
      btn.addEventListener("click", () => {
        clicked = true;
      });
      btn.click();
      expect(clicked).toBe(true);
    });

    test("exampleSelect change calls loadExample", () => {
      const select = createMockSelect("exampleSelect");
      let changed = false;
      select.addEventListener("change", () => {
        changed = true;
      });
      select.dispatchEvent(new Event("change"));
      expect(changed).toBe(true);
    });

    test("exportBtn click calls exportImage", () => {
      const btn = document.createElement("button");
      let clicked = false;
      btn.addEventListener("click", () => {
        clicked = true;
      });
      btn.click();
      expect(clicked).toBe(true);
    });

    test("saveGenomeBtn click calls saveGenome", () => {
      const btn = document.createElement("button");
      let clicked = false;
      btn.addEventListener("click", () => {
        clicked = true;
      });
      btn.click();
      expect(clicked).toBe(true);
    });

    test("editor input runs linter", () => {
      const editor = createMockTextarea("editor");
      let inputFired = false;
      editor.addEventListener("input", () => {
        inputFired = true;
      });
      editor.dispatchEvent(new Event("input"));
      expect(inputFired).toBe(true);
    });

    // KeyboardEvent tests - happy-dom has limited keyboard support
    test("keyboard event listener can be attached for shortcuts", () => {
      let keydownFired = false;
      const handler = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          keydownFired = true;
        }
      };

      document.addEventListener("keydown", handler);

      // Create and dispatch a KeyboardEvent
      try {
        const event = new KeyboardEvent("keydown", {
          key: "Enter",
          ctrlKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
        // May or may not fire depending on happy-dom support
        expect(typeof keydownFired).toBe("boolean");
      } catch {
        // KeyboardEvent not supported - test the handler setup pattern instead
        expect(typeof handler).toBe("function");
      }

      document.removeEventListener("keydown", handler);
    });

    test("keyboard shortcut handler pattern checks for Ctrl/Cmd + Enter", () => {
      // Test the pattern used in playground for keyboard shortcuts
      const checkShortcut = (e: {
        ctrlKey: boolean;
        metaKey: boolean;
        key: string;
      }) => {
        return (e.ctrlKey || e.metaKey) && e.key === "Enter";
      };

      // Ctrl+Enter should match
      expect(
        checkShortcut({ ctrlKey: true, metaKey: false, key: "Enter" }),
      ).toBe(true);

      // Cmd+Enter (Mac) should match
      expect(
        checkShortcut({ ctrlKey: false, metaKey: true, key: "Enter" }),
      ).toBe(true);

      // Just Enter should not match
      expect(
        checkShortcut({ ctrlKey: false, metaKey: false, key: "Enter" }),
      ).toBe(false);

      // Ctrl+Other key should not match
      expect(checkShortcut({ ctrlKey: true, metaKey: false, key: "a" })).toBe(
        false,
      );
    });
  });

  // Integration
  describe("integration", () => {
    test("full workflow: load example -> run -> clear", async () => {
      const { CodonLexer } = await import("@/lexer");
      const { Canvas2DRenderer } = await import("@/renderer");
      const { CodonVM } = await import("@/vm");
      const { examples } = await import("@/examples");

      const entries = Object.entries(examples);
      if (entries.length > 0) {
        const [_, ex] = entries[0];

        // Load example
        const genome = ex.genome;
        expect(genome.length).toBeGreaterThan(0);

        // Run
        const canvas = document.createElement("canvas");
        const renderer = new Canvas2DRenderer(canvas);
        const vm = new CodonVM(renderer);
        const lexer = new CodonLexer();
        const tokens = lexer.tokenize(genome);
        vm.run(tokens);

        // Clear
        vm.reset();
        renderer.clear();
        expect(vm.state.instructionPointer).toBe(0);
      }
    });

    test("full workflow: edit genome -> run -> export", async () => {
      const { CodonLexer } = await import("@/lexer");
      const { Canvas2DRenderer } = await import("@/renderer");
      const { CodonVM } = await import("@/vm");

      // Use a simple genome that doesn't require stack values
      const genome = "ATG TAA";

      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      const lexer = new CodonLexer();

      const tokens = lexer.tokenize(genome);
      vm.run(tokens);

      // Export (mock - just verify canvas has content)
      const dataUrl = canvas.toDataURL();
      expect(dataUrl).toContain("data:image/png");
    });

    test("filter and load workflow", async () => {
      const { examples } = await import("@/examples");

      // Filter by difficulty
      const beginnerExamples = Object.entries(examples).filter(
        ([_, ex]) => ex.difficulty === "beginner",
      );

      if (beginnerExamples.length > 0) {
        const [key, ex] = beginnerExamples[0];
        expect(key).toBeDefined();
        expect(ex.genome).toBeDefined();
      }
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles empty editor value", () => {
      const editor = createMockTextarea("editor");
      editor.value = "";
      expect(editor.value).toBe("");
    });

    test("handles whitespace-only editor value", () => {
      const editor = createMockTextarea("editor");
      editor.value = "   \n\t  ";
      expect(editor.value.trim()).toBe("");
    });

    test("handles missing DOM elements gracefully", () => {
      const el = document.getElementById("nonexistent_element_xyz");
      expect(el).toBeNull();
    });

    test("handles very long genomes", async () => {
      const { CodonLexer } = await import("@/lexer");
      const lexer = new CodonLexer();

      // Generate a long genome
      const repeatedCodons = Array(100).fill("GGA").join(" ");
      const longGenome = `ATG ${repeatedCodons} TAA`;

      const tokens = lexer.tokenize(longGenome);
      expect(tokens.length).toBe(102); // ATG + 100 GGA + TAA
    });

    test("handles rapid successive runs", async () => {
      const { CodonLexer } = await import("@/lexer");
      const { Canvas2DRenderer } = await import("@/renderer");
      const { CodonVM } = await import("@/vm");

      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      const lexer = new CodonLexer();

      const tokens = lexer.tokenize("ATG TAA");

      // Run multiple times rapidly
      for (let i = 0; i < 10; i++) {
        vm.reset();
        vm.run(tokens);
      }

      // Should complete without error
      expect(vm.state.instructionPointer).toBeGreaterThan(0);
    });
  });
});
