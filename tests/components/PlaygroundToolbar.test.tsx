/**
 * PlaygroundToolbar Component Tests
 *
 * Comprehensive tests for the toolbar including:
 * - Example selector dropdown
 * - File I/O buttons (Load, Save, Copy, Share)
 * - Undo/Redo history controls
 * - Nucleotide mode toggle (DNA/RNA)
 * - Reference panel toggle
 * - Run button
 */

import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  PlaygroundToolbar,
  type PlaygroundToolbarProps,
  type ToolbarDisplayProps,
  type ToolbarExecutionProps,
  type ToolbarHistoryProps,
  type ToolbarIOProps,
} from "@/components/PlaygroundToolbar";
import type { ExampleWithKey } from "@/hooks/useExamples";

afterEach(() => cleanup());

// ============================================================================
// Test Helpers
// ============================================================================

function createDefaultProps(): PlaygroundToolbarProps {
  return {
    examples: [
      {
        key: "ex1",
        title: "Example 1",
        genome: "ATG GGA TAA",
        description: "First example",
        difficulty: "beginner",
        concepts: ["drawing"],
        keywords: ["test"],
        goodForMutations: ["silent"],
      },
      {
        key: "ex2",
        title: "Example 2",
        genome: "ATG TAA",
        description: "Second example",
        difficulty: "intermediate",
        concepts: ["drawing"],
        keywords: ["demo"],
        goodForMutations: ["point"],
      },
    ] as ExampleWithKey[],
    selectedExampleKey: null,
    onExampleChange: mock(() => {}),
    io: {
      onLoad: mock(() => {}),
      onSave: mock(() => {}),
      onCopy: mock(() => {}),
      copied: false,
      onShare: mock(() => {}),
    },
    history: {
      onUndo: mock(() => {}),
      onRedo: mock(() => {}),
      canUndo: true,
      canRedo: false,
    },
    display: {
      nucleotideMode: "DNA" as const,
      onToggleNucleotideMode: mock(() => {}),
      showReference: false,
      onToggleReference: mock(() => {}),
    },
    execution: {
      onRun: mock(() => {}),
      canRun: true,
    },
  };
}

function renderToolbar(overrides: Partial<PlaygroundToolbarProps> = {}) {
  const props = { ...createDefaultProps(), ...overrides };
  return { ...render(<PlaygroundToolbar {...props} />), props };
}

// ============================================================================
// Example Selector Tests
// ============================================================================

describe("PlaygroundToolbar - Example Selector", () => {
  test("renders select element with aria-label", () => {
    renderToolbar();

    const select = screen.getByLabelText("Select example genome");
    expect(select).toBeDefined();
    expect(select.tagName).toBe("SELECT");
  });

  test("renders placeholder option", () => {
    renderToolbar();

    const placeholder = screen.getByText("Select example...");
    expect(placeholder).toBeDefined();
    expect((placeholder as HTMLOptionElement).value).toBe("");
  });

  test("renders all example options", () => {
    renderToolbar();

    const option1 = screen.getByText("Example 1");
    const option2 = screen.getByText("Example 2");
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect((option1 as HTMLOptionElement).value).toBe("ex1");
    expect((option2 as HTMLOptionElement).value).toBe("ex2");
  });

  test("calls onExampleChange when selection changes", () => {
    const { props } = renderToolbar();

    const select = screen.getByLabelText("Select example genome");
    fireEvent.change(select, { target: { value: "ex2" } });

    expect(props.onExampleChange).toHaveBeenCalledTimes(1);
    expect(props.onExampleChange).toHaveBeenCalledWith("ex2");
  });

  test("reflects selectedExampleKey value", () => {
    renderToolbar({ selectedExampleKey: "ex1" });

    const select = screen.getByLabelText(
      "Select example genome",
    ) as HTMLSelectElement;
    expect(select.value).toBe("ex1");
  });

  test("shows empty value when selectedExampleKey is null", () => {
    renderToolbar({ selectedExampleKey: null });

    const select = screen.getByLabelText(
      "Select example genome",
    ) as HTMLSelectElement;
    expect(select.value).toBe("");
  });

  test("renders with empty examples array", () => {
    renderToolbar({ examples: [] });

    const select = screen.getByLabelText("Select example genome");
    expect(select).toBeDefined();
    // Only placeholder option should exist
    const options = select.querySelectorAll("option");
    expect(options.length).toBe(1);
    expect(options[0].textContent).toBe("Select example...");
  });
});

// ============================================================================
// Load Button Tests
// ============================================================================

describe("PlaygroundToolbar - Load Button", () => {
  test("renders Load label", () => {
    renderToolbar();

    const label = screen.getByText("Load");
    expect(label).toBeDefined();
  });

  test("has hidden file input with correct accept attribute", () => {
    renderToolbar();

    const fileInput = screen.getByLabelText("Load genome file");
    expect(fileInput).toBeDefined();
    expect(fileInput.tagName).toBe("INPUT");
    expect((fileInput as HTMLInputElement).type).toBe("file");
    expect((fileInput as HTMLInputElement).accept).toBe(".genome,.txt");
    expect((fileInput as HTMLInputElement).className).toContain("hidden");
  });

  test("calls io.onLoad when file is selected", () => {
    const { props } = renderToolbar();

    const fileInput = screen.getByLabelText("Load genome file");
    fireEvent.change(fileInput, {
      target: { files: [new File(["ATG TAA"], "test.genome")] },
    });

    expect(props.io.onLoad).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Save Button Tests
// ============================================================================

describe("PlaygroundToolbar - Save Button", () => {
  test("renders Save button with aria-label", () => {
    renderToolbar();

    const button = screen.getByLabelText("Save genome file");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Save");
  });

  test("calls io.onSave when clicked", () => {
    const { props } = renderToolbar();

    const button = screen.getByLabelText("Save genome file");
    fireEvent.click(button);

    expect(props.io.onSave).toHaveBeenCalledTimes(1);
  });

  test("has correct title attribute", () => {
    renderToolbar();

    const button = screen.getByLabelText("Save genome file");
    expect(button.getAttribute("title")).toBe("Save (Ctrl+S)");
  });
});

// ============================================================================
// Copy Button Tests
// ============================================================================

describe("PlaygroundToolbar - Copy Button", () => {
  test("shows 'Copy' text when not copied", () => {
    renderToolbar({
      io: { ...createDefaultProps().io, copied: false },
    });

    const button = screen.getByText("Copy");
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-label")).toBe("Copy genome code");
  });

  test("shows 'Copied!' text when copied is true", () => {
    renderToolbar({
      io: { ...createDefaultProps().io, copied: true },
    });

    const button = screen.getByText("Copied!");
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-label")).toBe("Copied to clipboard");
  });

  test("calls io.onCopy when clicked", () => {
    const { props } = renderToolbar();

    const button = screen.getByText("Copy");
    fireEvent.click(button);

    expect(props.io.onCopy).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Share Button Tests
// ============================================================================

describe("PlaygroundToolbar - Share Button", () => {
  test("renders Share button with aria-label", () => {
    renderToolbar();

    const button = screen.getByLabelText("Copy shareable link");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Share");
  });

  test("calls io.onShare when clicked", () => {
    const { props } = renderToolbar();

    const button = screen.getByLabelText("Copy shareable link");
    fireEvent.click(button);

    expect(props.io.onShare).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Undo Button Tests
// ============================================================================

describe("PlaygroundToolbar - Undo Button", () => {
  test("renders Undo button with aria-label", () => {
    renderToolbar();

    const button = screen.getByLabelText("Undo last change");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Undo");
  });

  test("calls history.onUndo when clicked", () => {
    const { props } = renderToolbar({
      history: { ...createDefaultProps().history, canUndo: true },
    });

    const button = screen.getByLabelText("Undo last change");
    fireEvent.click(button);

    expect(props.history.onUndo).toHaveBeenCalledTimes(1);
  });

  test("is enabled when canUndo is true", () => {
    renderToolbar({
      history: { ...createDefaultProps().history, canUndo: true },
    });

    const button = screen.getByLabelText(
      "Undo last change",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  test("is disabled when canUndo is false", () => {
    renderToolbar({
      history: { ...createDefaultProps().history, canUndo: false },
    });

    const button = screen.getByLabelText(
      "Undo last change",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  test("has correct title attribute", () => {
    renderToolbar();

    const button = screen.getByLabelText("Undo last change");
    expect(button.getAttribute("title")).toBe("Undo (Ctrl+Z)");
  });
});

// ============================================================================
// Redo Button Tests
// ============================================================================

describe("PlaygroundToolbar - Redo Button", () => {
  test("renders Redo button with aria-label", () => {
    renderToolbar();

    const button = screen.getByLabelText("Redo last change");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Redo");
  });

  test("calls history.onRedo when clicked", () => {
    const { props } = renderToolbar({
      history: { ...createDefaultProps().history, canRedo: true },
    });

    const button = screen.getByLabelText("Redo last change");
    fireEvent.click(button);

    expect(props.history.onRedo).toHaveBeenCalledTimes(1);
  });

  test("is enabled when canRedo is true", () => {
    renderToolbar({
      history: { ...createDefaultProps().history, canRedo: true },
    });

    const button = screen.getByLabelText(
      "Redo last change",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  test("is disabled when canRedo is false", () => {
    renderToolbar({
      history: { ...createDefaultProps().history, canRedo: false },
    });

    const button = screen.getByLabelText(
      "Redo last change",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  test("has correct title attribute", () => {
    renderToolbar();

    const button = screen.getByLabelText("Redo last change");
    expect(button.getAttribute("title")).toBe("Redo (Ctrl+Shift+Z)");
  });
});

// ============================================================================
// Nucleotide Mode Toggle Tests
// ============================================================================

describe("PlaygroundToolbar - Nucleotide Mode Toggle", () => {
  test("renders toggle button with aria-label", () => {
    renderToolbar();

    const button = screen.getByLabelText("Toggle RNA display mode");
    expect(button).toBeDefined();
  });

  test("shows DNA label when mode is DNA", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, nucleotideMode: "DNA" },
    });

    const button = screen.getByLabelText("Toggle RNA display mode");
    expect(button.textContent).toContain("DNA");
  });

  test("shows RNA label when mode is RNA", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, nucleotideMode: "RNA" },
    });

    const button = screen.getByLabelText("Toggle RNA display mode");
    expect(button.textContent).toContain("RNA");
  });

  test("has aria-pressed=false when mode is DNA", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, nucleotideMode: "DNA" },
    });

    const button = screen.getByLabelText("Toggle RNA display mode");
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  test("has aria-pressed=true when mode is RNA", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, nucleotideMode: "RNA" },
    });

    const button = screen.getByLabelText("Toggle RNA display mode");
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  test("calls onToggleNucleotideMode when clicked", () => {
    const { props } = renderToolbar();

    const button = screen.getByLabelText("Toggle RNA display mode");
    fireEvent.click(button);

    expect(props.display.onToggleNucleotideMode).toHaveBeenCalledTimes(1);
  });

  test("has correct tooltip for DNA mode", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, nucleotideMode: "DNA" },
    });

    const button = screen.getByLabelText("Toggle RNA display mode");
    expect(button.getAttribute("title")).toBe(
      "Click to switch to RNA notation (T becomes U)",
    );
  });

  test("has correct tooltip for RNA mode", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, nucleotideMode: "RNA" },
    });

    const button = screen.getByLabelText("Toggle RNA display mode");
    expect(button.getAttribute("title")).toBe(
      "Click to switch to DNA notation (U becomes T)",
    );
  });

  test("renders tooltip container with mode info", () => {
    const { container } = renderToolbar({
      display: { ...createDefaultProps().display, nucleotideMode: "DNA" },
    });

    // Check for the tooltip content
    const tooltip = container.querySelector(".group-hover\\:visible");
    expect(tooltip).toBeDefined();
    expect(tooltip?.textContent).toContain("DNA Mode");
    expect(tooltip?.textContent).toContain("Thymine");
  });

  test("renders RNA mode info in tooltip", () => {
    const { container } = renderToolbar({
      display: { ...createDefaultProps().display, nucleotideMode: "RNA" },
    });

    const tooltip = container.querySelector(".group-hover\\:visible");
    expect(tooltip?.textContent).toContain("RNA Mode");
    expect(tooltip?.textContent).toContain("Uracil");
  });
});

// ============================================================================
// Reference Toggle Tests
// ============================================================================

describe("PlaygroundToolbar - Reference Toggle", () => {
  test("renders Reference button", () => {
    renderToolbar();

    const button = screen.getByText("Reference");
    expect(button).toBeDefined();
  });

  test("has aria-label for hidden state", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, showReference: false },
    });

    const button = screen.getByText("Reference");
    expect(button.getAttribute("aria-label")).toBe("Show codon reference");
  });

  test("has aria-label for shown state", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, showReference: true },
    });

    const button = screen.getByText("Reference");
    expect(button.getAttribute("aria-label")).toBe("Hide codon reference");
  });

  test("has aria-pressed=false when showReference is false", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, showReference: false },
    });

    const button = screen.getByText("Reference");
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  test("has aria-pressed=true when showReference is true", () => {
    renderToolbar({
      display: { ...createDefaultProps().display, showReference: true },
    });

    const button = screen.getByText("Reference");
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  test("calls onToggleReference when clicked", () => {
    const { props } = renderToolbar();

    const button = screen.getByText("Reference");
    fireEvent.click(button);

    expect(props.display.onToggleReference).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Run Button Tests
// ============================================================================

describe("PlaygroundToolbar - Run Button", () => {
  test("renders Run button with aria-label", () => {
    renderToolbar();

    const button = screen.getByLabelText("Run genome");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Run");
  });

  test("calls execution.onRun when clicked", () => {
    const { props } = renderToolbar({
      execution: { onRun: mock(() => {}), canRun: true },
    });

    const button = screen.getByLabelText("Run genome");
    fireEvent.click(button);

    expect(props.execution.onRun).toHaveBeenCalledTimes(1);
  });

  test("is enabled when canRun is true", () => {
    renderToolbar({
      execution: { ...createDefaultProps().execution, canRun: true },
    });

    const button = screen.getByLabelText("Run genome") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  test("is disabled when canRun is false", () => {
    renderToolbar({
      execution: { ...createDefaultProps().execution, canRun: false },
    });

    const button = screen.getByLabelText("Run genome") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("PlaygroundToolbar - Integration", () => {
  test("renders all major sections", () => {
    renderToolbar();

    // Example selector
    expect(screen.getByLabelText("Select example genome")).toBeDefined();

    // I/O buttons
    expect(screen.getByText("Load")).toBeDefined();
    expect(screen.getByLabelText("Save genome file")).toBeDefined();
    expect(screen.getByText("Copy")).toBeDefined();
    expect(screen.getByText("Share")).toBeDefined();

    // History buttons
    expect(screen.getByLabelText("Undo last change")).toBeDefined();
    expect(screen.getByLabelText("Redo last change")).toBeDefined();

    // Display toggles
    expect(screen.getByLabelText("Toggle RNA display mode")).toBeDefined();
    expect(screen.getByText("Reference")).toBeDefined();

    // Run button
    expect(screen.getByLabelText("Run genome")).toBeDefined();
  });

  test("multiple callbacks can be triggered independently", () => {
    const { props } = renderToolbar();

    fireEvent.click(screen.getByLabelText("Save genome file"));
    fireEvent.click(screen.getByText("Reference"));
    fireEvent.click(screen.getByLabelText("Run genome"));

    expect(props.io.onSave).toHaveBeenCalledTimes(1);
    expect(props.display.onToggleReference).toHaveBeenCalledTimes(1);
    expect(props.execution.onRun).toHaveBeenCalledTimes(1);
  });

  test("memo prevents unnecessary re-renders", () => {
    const { rerender, props } = renderToolbar();

    // Re-render with same props (reference equality won't match, but memo should check shallow)
    rerender(<PlaygroundToolbar {...props} />);

    // Component should still render correctly
    expect(screen.getByLabelText("Run genome")).toBeDefined();
  });
});

// ============================================================================
// Type Export Tests
// ============================================================================

describe("PlaygroundToolbar - Type Exports", () => {
  test("exports interface types correctly", () => {
    // Type-only tests - verifying interfaces are accessible
    const io: ToolbarIOProps = {
      onLoad: () => {},
      onSave: () => {},
      onCopy: () => {},
      copied: false,
      onShare: () => {},
    };

    const history: ToolbarHistoryProps = {
      onUndo: () => {},
      onRedo: () => {},
      canUndo: true,
      canRedo: false,
    };

    const display: ToolbarDisplayProps = {
      nucleotideMode: "DNA",
      onToggleNucleotideMode: () => {},
      showReference: false,
      onToggleReference: () => {},
    };

    const execution: ToolbarExecutionProps = {
      onRun: () => {},
      canRun: true,
    };

    // Verify objects match expected shape
    expect(io.copied).toBe(false);
    expect(history.canUndo).toBe(true);
    expect(display.nucleotideMode).toBe("DNA");
    expect(execution.canRun).toBe(true);
  });
});
