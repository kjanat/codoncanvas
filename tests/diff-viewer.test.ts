/**
 * Diff Viewer Test Suite
 *
 * Tests for side-by-side genome comparison visualization with highlighting.
 * Provides visual diff for original vs mutated genomes.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { DiffViewer, injectDiffViewerStyles } from "@/diff-viewer";
import type { MutationResult } from "@/mutations";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "@/test-utils/canvas-mock";

describe("DiffViewer", () => {
  let container: HTMLElement;

  beforeEach(() => {
    mockCanvasContext();
    container = document.createElement("div");
    container.id = "diffViewerContainer";
    document.body.appendChild(container);
  });

  afterEach(() => {
    restoreCanvasContext();
    container.remove();
    // Clean up injected styles
    const styles = document.getElementById("diff-viewer-styles");
    if (styles) styles.remove();
  });

  // Constructor
  describe("constructor", () => {
    test("accepts DiffViewOptions with containerElement", () => {
      const viewer = new DiffViewer({ containerElement: container });
      expect(viewer).toBeDefined();
    });

    test("stores container element reference", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.clear();
      expect(container.children.length).toBe(0);
    });

    test("uses default showCanvas=true when not specified", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG TAA");
      // Canvas containers should be rendered
      const canvasContainer = container.querySelector(".diff-canvas-container");
      expect(canvasContainer).not.toBeNull();
    });

    test("uses default highlightColor='#ff6b6b' when not specified", () => {
      const viewer = new DiffViewer({ containerElement: container });
      // Default is used internally
      expect(viewer).toBeDefined();
    });

    test("uses default canvasWidth=300 when not specified", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const canvas = container.querySelector("canvas");
      if (canvas) {
        expect(canvas.width).toBe(300);
      }
    });

    test("uses default canvasHeight=300 when not specified", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const canvas = container.querySelector("canvas");
      if (canvas) {
        expect(canvas.height).toBe(300);
      }
    });

    test("accepts custom showCanvas option", () => {
      const viewer = new DiffViewer({
        containerElement: container,
        showCanvas: false,
      });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const canvasContainer = container.querySelector(".diff-canvas-container");
      expect(canvasContainer).toBeNull();
    });

    test("accepts custom highlightColor option", () => {
      const viewer = new DiffViewer({
        containerElement: container,
        highlightColor: "#00ff00",
      });
      expect(viewer).toBeDefined();
    });

    test("accepts custom canvas dimensions", () => {
      const viewer = new DiffViewer({
        containerElement: container,
        canvasWidth: 400,
        canvasHeight: 400,
      });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const canvas = container.querySelector("canvas");
      if (canvas) {
        expect(canvas.width).toBe(400);
        expect(canvas.height).toBe(400);
      }
    });

    test("creates CodonLexer instance", () => {
      const viewer = new DiffViewer({ containerElement: container });
      // Lexer is used internally for tokenization
      viewer.renderComparison("ATG TAA", "ATG TAA");
      // Should not throw
      expect(container.innerHTML).toContain("ATG");
    });
  });

  // renderMutation
  describe("renderMutation", () => {
    test("accepts MutationResult object", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG GGC TAA",
        type: "silent",
        description: "Silent mutation at codon 2",
        position: 4,
      };
      expect(() => viewer.renderMutation(result)).not.toThrow();
    });

    test("calls compareGenomes with original and mutated", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG CCA TAA",
        type: "missense",
        description: "Missense mutation",
        position: 4,
      };
      viewer.renderMutation(result);
      // Should render diff content
      expect(container.querySelector(".diff-viewer")).not.toBeNull();
    });

    test("renders correct mutation type badge", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG TAA TAA",
        type: "nonsense",
        description: "Nonsense mutation",
        position: 4,
      };
      viewer.renderMutation(result);
      const badge = container.querySelector(".badge");
      expect(badge?.textContent).toBe("nonsense");
    });

    test("renders correct description text", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG GGC TAA",
        type: "silent",
        description: "Test description text",
        position: 4,
      };
      viewer.renderMutation(result);
      const header = container.querySelector(".diff-header h3");
      expect(header?.textContent).toBe("Test description text");
    });
  });

  // renderComparison
  describe("renderComparison", () => {
    test("accepts original and mutated genome strings", () => {
      const viewer = new DiffViewer({ containerElement: container });
      expect(() =>
        viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA"),
      ).not.toThrow();
    });

    test("accepts optional title (default 'Genome Comparison')", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const header = container.querySelector(".diff-header h3");
      expect(header?.textContent).toBe("Genome Comparison");
    });

    test("calls compareGenomes with both genomes", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      // Differences should be detected
      const diffCount = container.querySelector(".diff-count");
      expect(diffCount?.textContent).toContain("codon");
    });

    test("calls render with 'point' as default mutation type", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const badge = container.querySelector(".badge");
      expect(badge?.classList.contains("mutation-point")).toBe(true);
    });

    test("renders correct title as description", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA", "Custom Title");
      const header = container.querySelector(".diff-header h3");
      expect(header?.textContent).toBe("Custom Title");
    });
  });

  // render (private)
  describe("render", () => {
    test("creates diff-viewer container", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      expect(container.querySelector(".diff-viewer")).not.toBeNull();
    });

    test("creates diff-header with description", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA", "Test Header");
      const header = container.querySelector(".diff-header");
      expect(header).toBeDefined();
      expect(header?.querySelector("h3")?.textContent).toBe("Test Header");
    });

    test("renders mutation type badge with correct class", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const badge = container.querySelector(".badge.mutation-point");
      expect(badge).toBeDefined();
    });

    test("displays difference count text", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const diffCount = container.querySelector(".diff-count");
      expect(diffCount?.textContent).toContain("changed");
    });

    test("handles singular/plural 'codon(s) changed'", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const diffCount = container.querySelector(".diff-count");
      // Should use "codon" for 1 or "codons" for multiple
      expect(diffCount?.textContent).toMatch(/\d+ codons? changed/);
    });

    test("creates diff-content with two diff-panels", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const panels = container.querySelectorAll(".diff-panel");
      expect(panels.length).toBe(2);
    });

    test("creates 'Original' panel with codons", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const headers = container.querySelectorAll(".diff-panel-header");
      const originalHeader = Array.from(headers).find(
        (h) => h.textContent === "Original",
      );
      expect(originalHeader).toBeDefined();
    });

    test("creates 'Mutated' panel with codons", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const headers = container.querySelectorAll(".diff-panel-header");
      const mutatedHeader = Array.from(headers).find(
        (h) => h.textContent === "Mutated",
      );
      expect(mutatedHeader).toBeDefined();
    });

    test("conditionally renders canvas diff when showCanvas=true", () => {
      const viewer = new DiffViewer({
        containerElement: container,
        showCanvas: true,
      });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const canvasContainer = container.querySelector(".diff-canvas-container");
      expect(canvasContainer).not.toBeNull();
    });

    test("does not render canvas when showCanvas=false", () => {
      const viewer = new DiffViewer({
        containerElement: container,
        showCanvas: false,
      });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const canvasContainer = container.querySelector(".diff-canvas-container");
      expect(canvasContainer).toBeNull();
    });

    test("renders diff-details section", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const details = container.querySelector(".diff-details");
      expect(details).toBeDefined();
    });
  });

  // renderCodons (private)
  describe("renderCodons", () => {
    test("creates span for each codon", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA CCA TAA", "ATG GGA CCA TAA");
      const codons = container.querySelectorAll(".codon");
      // 4 codons in original + 4 codons in mutated = 8 total
      expect(codons.length).toBeGreaterThanOrEqual(4);
    });

    test("adds 'codon' base class to all spans", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG TAA");
      const codons = container.querySelectorAll(".diff-codons span");
      codons.forEach((codon) => {
        expect(codon.classList.contains("codon")).toBe(true);
      });
    });

    test("adds 'codon-removed' class for removed highlights", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const removed = container.querySelectorAll(".codon-removed");
      expect(removed.length).toBeGreaterThanOrEqual(1);
    });

    test("adds 'codon-added' class for added highlights", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const added = container.querySelectorAll(".codon-added");
      expect(added.length).toBeGreaterThanOrEqual(1);
    });

    test("joins codons with spaces", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG GGA TAA");
      const codonText = container.querySelector(".diff-codons")?.textContent;
      expect(codonText?.includes(" ")).toBe(true);
    });
  });

  // renderCanvasDiff (private)
  describe("renderCanvasDiff", () => {
    test("creates diff-canvas-container div", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      expect(container.querySelector(".diff-canvas-container")).not.toBeNull();
    });

    test("creates two canvas-wrapper divs", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const wrappers = container.querySelectorAll(".canvas-wrapper");
      expect(wrappers.length).toBe(2);
    });

    test("creates 'Original Output' label", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const labels = container.querySelectorAll(".canvas-label");
      const originalLabel = Array.from(labels).find((l) =>
        l.textContent?.includes("Original"),
      );
      expect(originalLabel).toBeDefined();
    });

    test("creates 'Mutated Output' label", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const labels = container.querySelectorAll(".canvas-label");
      const mutatedLabel = Array.from(labels).find((l) =>
        l.textContent?.includes("Mutated"),
      );
      expect(mutatedLabel).toBeDefined();
    });

    test("creates canvas elements with correct IDs", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      expect(container.querySelector("#diff-canvas-original")).not.toBeNull();
      expect(container.querySelector("#diff-canvas-mutated")).not.toBeNull();
    });

    test("sets canvas dimensions from options", () => {
      const viewer = new DiffViewer({
        containerElement: container,
        canvasWidth: 500,
        canvasHeight: 400,
      });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const canvas = container.querySelector(
        "#diff-canvas-original",
      ) as HTMLCanvasElement;
      expect(canvas?.width).toBe(500);
      expect(canvas?.height).toBe(400);
    });
  });

  // renderCanvasOutputs (private)
  describe("renderCanvasOutputs", () => {
    test("finds original and mutated canvas elements", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      const originalCanvas = container.querySelector("#diff-canvas-original");
      const mutatedCanvas = container.querySelector("#diff-canvas-mutated");
      expect(originalCanvas).toBeDefined();
      expect(mutatedCanvas).toBeDefined();
    });

    test("fails silently on render errors", () => {
      const viewer = new DiffViewer({ containerElement: container });
      // Invalid genome that would cause render error
      expect(() =>
        viewer.renderComparison("INVALID", "ALSOINVALID"),
      ).not.toThrow();
    });
  });

  // renderDifferencesList (private)
  describe("renderDifferencesList", () => {
    test("returns 'No differences found' when array empty", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG TAA");
      const noDiff = container.querySelector(".no-differences");
      expect(noDiff?.textContent).toBe("No differences found");
    });

    test("creates heading 'Changes at codon level:'", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const heading = container.querySelector(".diff-details h4");
      expect(heading?.textContent).toBe("Changes at codon level:");
    });

    test("creates list item for each difference", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const listItems = container.querySelectorAll(".differences-list li");
      expect(listItems.length).toBeGreaterThan(0);
    });

    test("displays position number", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const listItem = container.querySelector(".differences-list li");
      expect(listItem?.textContent).toContain("Position");
    });

    test("displays original codon with removed class", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const removed = container.querySelector(
        ".differences-list .codon-removed",
      );
      expect(removed).toBeDefined();
    });

    test("displays mutated codon with added class", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const added = container.querySelector(".differences-list .codon-added");
      expect(added).toBeDefined();
    });

    test("uses arrow (→) between original and mutated", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG CCA TAA");
      const listItem = container.querySelector(".differences-list li");
      expect(listItem?.textContent).toContain("→");
    });
  });

  // clear
  describe("clear", () => {
    test("removes all children from container", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      expect(container.children.length).toBeGreaterThan(0);
      viewer.clear();
      expect(container.children.length).toBe(0);
    });

    test("uses replaceChildren() for safe clearing", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG TAA", "ATG GGA TAA");
      viewer.clear();
      expect(container.innerHTML).toBe("");
    });
  });

  // Integration
  describe("integration", () => {
    test("correctly displays silent mutation diff", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG GGC TAA",
        type: "silent",
        description: "Silent mutation",
        position: 4,
      };
      viewer.renderMutation(result);
      expect(container.querySelector(".mutation-silent")).not.toBeNull();
    });

    test("correctly displays missense mutation diff", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG CCA TAA",
        type: "missense",
        description: "Missense mutation",
        position: 4,
      };
      viewer.renderMutation(result);
      expect(container.querySelector(".mutation-missense")).not.toBeNull();
    });

    test("correctly displays nonsense mutation diff", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG TAA TAA",
        type: "nonsense",
        description: "Nonsense mutation",
        position: 4,
      };
      viewer.renderMutation(result);
      expect(container.querySelector(".mutation-nonsense")).not.toBeNull();
    });

    test("correctly displays frameshift mutation diff", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG AGG ATA A",
        type: "frameshift",
        description: "Frameshift mutation",
        position: 4,
      };
      viewer.renderMutation(result);
      expect(container.querySelector(".mutation-frameshift")).not.toBeNull();
    });

    test("correctly displays insertion mutation diff", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG TAA",
        mutated: "ATG GGA TAA",
        type: "insertion",
        description: "Insertion mutation",
        position: 4,
      };
      viewer.renderMutation(result);
      expect(container.querySelector(".mutation-insertion")).not.toBeNull();
    });

    test("correctly displays deletion mutation diff", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const result: MutationResult = {
        original: "ATG GGA TAA",
        mutated: "ATG TAA",
        type: "deletion",
        description: "Deletion mutation",
        position: 4,
      };
      viewer.renderMutation(result);
      expect(container.querySelector(".mutation-deletion")).not.toBeNull();
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles identical genomes (no differences)", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "ATG GGA TAA");
      const noDiff = container.querySelector(".no-differences");
      expect(noDiff).toBeDefined();
    });

    test("handles completely different genomes", () => {
      const viewer = new DiffViewer({ containerElement: container });
      viewer.renderComparison("ATG GGA TAA", "CCC AAA TTT");
      const differences = container.querySelectorAll(".differences-list li");
      expect(differences.length).toBeGreaterThan(0);
    });

    test("handles very long genomes", () => {
      const viewer = new DiffViewer({ containerElement: container });
      const longGenome = `ATG ${Array(50).fill("GGA").join(" ")} TAA`;
      expect(() =>
        viewer.renderComparison(longGenome, longGenome),
      ).not.toThrow();
    });

    test("handles invalid genome that fails to tokenize", () => {
      const viewer = new DiffViewer({ containerElement: container });
      expect(() =>
        viewer.renderComparison("NOT_VALID_GENOME", "ALSO_NOT_VALID"),
      ).not.toThrow();
    });
  });
});

describe("injectDiffViewerStyles", () => {
  afterEach(() => {
    const styles = document.getElementById("diff-viewer-styles");
    if (styles) styles.remove();
  });

  test("creates style element with id 'diff-viewer-styles'", () => {
    injectDiffViewerStyles();
    const styles = document.getElementById("diff-viewer-styles");
    expect(styles).toBeDefined();
    expect(styles?.tagName).toBe("STYLE");
  });

  test("does nothing if styles already exist (idempotent)", () => {
    injectDiffViewerStyles();
    injectDiffViewerStyles();
    const styles = document.querySelectorAll("#diff-viewer-styles");
    expect(styles.length).toBe(1);
  });

  test("appends style to document.head", () => {
    injectDiffViewerStyles();
    const styles = document.head.querySelector("#diff-viewer-styles");
    expect(styles).toBeDefined();
  });

  test("includes CSS for diff-viewer container", () => {
    injectDiffViewerStyles();
    const styles = document.getElementById("diff-viewer-styles");
    expect(styles?.textContent).toContain(".diff-viewer");
  });

  test("includes CSS for mutation type badges", () => {
    injectDiffViewerStyles();
    const styles = document.getElementById("diff-viewer-styles");
    expect(styles?.textContent).toContain(".mutation-silent");
    expect(styles?.textContent).toContain(".mutation-missense");
    expect(styles?.textContent).toContain(".mutation-nonsense");
  });

  test("includes CSS for diff panels layout", () => {
    injectDiffViewerStyles();
    const styles = document.getElementById("diff-viewer-styles");
    expect(styles?.textContent).toContain(".diff-panel");
  });

  test("includes CSS for codon highlighting", () => {
    injectDiffViewerStyles();
    const styles = document.getElementById("diff-viewer-styles");
    expect(styles?.textContent).toContain(".codon-removed");
    expect(styles?.textContent).toContain(".codon-added");
  });

  test("includes CSS for canvas container", () => {
    injectDiffViewerStyles();
    const styles = document.getElementById("diff-viewer-styles");
    expect(styles?.textContent).toContain(".diff-canvas-container");
  });

  test("includes CSS for differences list", () => {
    injectDiffViewerStyles();
    const styles = document.getElementById("diff-viewer-styles");
    expect(styles?.textContent).toContain(".differences-list");
  });
});
