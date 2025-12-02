import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import {
  PlaygroundEditor,
  type PlaygroundEditorProps,
} from "@/components/PlaygroundEditor";
import type { GenomeValidation } from "@/hooks/useGenome";
import type { ParseError } from "@/types";

afterEach(() => cleanup());

// Helper to create ParseError
function createError(
  message: string,
  position: number,
  severity: "error" | "warning" = "error",
): ParseError {
  return { message, position, severity };
}

// Validation helpers
const validValidation: GenomeValidation = {
  isValid: true,
  tokens: [],
  errors: [],
  warnings: [],
  tokenizeError: null,
};

const invalidValidation: GenomeValidation = {
  isValid: false,
  tokens: [],
  errors: [createError("Invalid codon", 5)],
  warnings: [],
  tokenizeError: null,
};

const warningValidation: GenomeValidation = {
  isValid: true,
  tokens: [],
  errors: [],
  warnings: [createError("Unused variable", 10, "warning")],
  tokenizeError: null,
};

const tokenizeErrorValidation: GenomeValidation = {
  isValid: false,
  tokens: [],
  errors: [],
  warnings: [],
  tokenizeError: "Unexpected character",
};

const multipleErrorsValidation: GenomeValidation = {
  isValid: false,
  tokens: [],
  errors: [
    createError("Invalid codon", 5),
    createError("Unknown sequence", 0), // Position 0 still counts as having position
  ],
  warnings: [],
  tokenizeError: null,
};

const multipleWarningsValidation: GenomeValidation = {
  isValid: true,
  tokens: [],
  errors: [],
  warnings: [
    createError("Unused variable", 10, "warning"),
    createError("Deprecated syntax", 0, "warning"),
  ],
  tokenizeError: null,
};

const combinedValidation: GenomeValidation = {
  isValid: false,
  tokens: [],
  errors: [createError("Invalid codon", 5)],
  warnings: [createError("Unused variable", 10, "warning")],
  tokenizeError: "Unexpected character",
};

// Default props helper
function createDefaultProps(
  overrides?: Partial<PlaygroundEditorProps>,
): PlaygroundEditorProps {
  return {
    displayedGenome: "ATG GAA AAT GGA TAA",
    onGenomeChange: mock(() => {}),
    validation: validValidation,
    isPending: false,
    stats: { codons: 5, instructions: 3 },
    nucleotideMode: "DNA",
    ...overrides,
  };
}

describe("PlaygroundEditor", () => {
  describe("Textarea", () => {
    test("has aria-label 'Genome editor'", () => {
      render(<PlaygroundEditor {...createDefaultProps()} />);
      expect(screen.getByLabelText("Genome editor")).toBeDefined();
    });

    test("displays displayedGenome as value", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ displayedGenome: "AUG GGA UAA" })}
        />,
      );
      const textarea = screen.getByLabelText("Genome editor");
      expect(textarea).toHaveProperty("value", "AUG GGA UAA");
    });

    test("placeholder shows DNA example when nucleotideMode='DNA'", () => {
      render(
        <PlaygroundEditor {...createDefaultProps({ nucleotideMode: "DNA" })} />,
      );
      const textarea = screen.getByLabelText("Genome editor");
      expect(textarea.getAttribute("placeholder")).toContain(
        "ATG GAA AAT GGA TAA",
      );
    });

    test("placeholder shows RNA example when nucleotideMode='RNA'", () => {
      render(
        <PlaygroundEditor {...createDefaultProps({ nucleotideMode: "RNA" })} />,
      );
      const textarea = screen.getByLabelText("Genome editor");
      expect(textarea.getAttribute("placeholder")).toContain(
        "AUG GAA AAU GGA UAA",
      );
    });

    test("has spellCheck=false", () => {
      render(<PlaygroundEditor {...createDefaultProps()} />);
      const textarea = screen.getByLabelText("Genome editor");
      expect(textarea.getAttribute("spellcheck")).toBe("false");
    });

    test("calls onGenomeChange on input", () => {
      const onGenomeChange = mock(() => {});
      render(<PlaygroundEditor {...createDefaultProps({ onGenomeChange })} />);
      const textarea = screen.getByLabelText("Genome editor");
      fireEvent.change(textarea, { target: { value: "AUG" } });
      expect(onGenomeChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("ValidationStatus - pending", () => {
    test("shows 'Validating...' when isPending=true", () => {
      render(<PlaygroundEditor {...createDefaultProps({ isPending: true })} />);
      expect(screen.getByText("Validating...")).toBeDefined();
    });
  });

  describe("ValidationStatus - valid", () => {
    test("shows 'Valid' text when validation is valid and not pending", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: validValidation })}
        />,
      );
      expect(screen.getByText("Valid")).toBeDefined();
    });
  });

  describe("ValidationStatus - invalid", () => {
    test("shows error count when validation has errors", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: invalidValidation })}
        />,
      );
      expect(screen.getByText("1 error(s)")).toBeDefined();
    });

    test("shows correct error count for multiple errors", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: multipleErrorsValidation })}
        />,
      );
      expect(screen.getByText("2 error(s)")).toBeDefined();
    });
  });

  describe("Stats display", () => {
    test("shows codons and instructions count", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ stats: { codons: 10, instructions: 7 } })}
        />,
      );
      expect(screen.getByText("10 codons, 7 instructions")).toBeDefined();
    });

    test("shows zero values correctly", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ stats: { codons: 0, instructions: 0 } })}
        />,
      );
      expect(screen.getByText("0 codons, 0 instructions")).toBeDefined();
    });
  });

  describe("ErrorDisplay", () => {
    test("not rendered when no errors and no tokenizeError", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: validValidation })}
        />,
      );
      expect(screen.queryByRole("alert")).toBeNull();
    });

    test("has role='alert' when shown", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: invalidValidation })}
        />,
      );
      expect(screen.getByRole("alert")).toBeDefined();
    });

    test("displays tokenizeError", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: tokenizeErrorValidation })}
        />,
      );
      expect(screen.getByText("Unexpected character")).toBeDefined();
    });

    test("displays errors with position prefix when position exists", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: invalidValidation })}
        />,
      );
      expect(screen.getByText(/Position 5:/)).toBeDefined();
      expect(screen.getByText(/Invalid codon/)).toBeDefined();
    });

    test("displays errors with position 0 correctly", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: multipleErrorsValidation })}
        />,
      );
      // Position 0 is still a valid position
      expect(screen.getByText(/Position 0:/)).toBeDefined();
      expect(screen.getByText(/Unknown sequence/)).toBeDefined();
    });

    test("displays both tokenizeError and regular errors", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: combinedValidation })}
        />,
      );
      expect(screen.getByText("Unexpected character")).toBeDefined();
      expect(screen.getByText(/Invalid codon/)).toBeDefined();
    });
  });

  describe("WarningDisplay", () => {
    test("not rendered when no warnings", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: validValidation })}
        />,
      );
      // No output element should exist
      expect(document.querySelector("output")).toBeNull();
    });

    test("renders as <output> element", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: warningValidation })}
        />,
      );
      const output = document.querySelector("output");
      expect(output).toBeDefined();
      expect(output).not.toBeNull();
    });

    test("displays warnings with position", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: warningValidation })}
        />,
      );
      expect(screen.getByText(/Position 10:/)).toBeDefined();
      expect(screen.getByText(/Unused variable/)).toBeDefined();
    });

    test("displays warnings with position 0", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: multipleWarningsValidation })}
        />,
      );
      expect(screen.getByText(/Position 0:/)).toBeDefined();
      expect(screen.getByText(/Deprecated syntax/)).toBeDefined();
    });
  });

  describe("Ref forwarding", () => {
    test("ref is forwarded to textarea", () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<PlaygroundEditor {...createDefaultProps()} ref={ref} />);
      expect(ref.current).toBeDefined();
      expect(ref.current).not.toBeNull();
      expect(ref.current?.tagName).toBe("TEXTAREA");
    });

    test("ref allows programmatic focus", () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<PlaygroundEditor {...createDefaultProps()} ref={ref} />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });

  describe("Component structure", () => {
    test("renders all sections when errors and warnings present", () => {
      render(
        <PlaygroundEditor
          {...createDefaultProps({ validation: combinedValidation })}
        />,
      );
      // Textarea
      expect(screen.getByLabelText("Genome editor")).toBeDefined();
      // Error display
      expect(screen.getByRole("alert")).toBeDefined();
      // Warning display
      expect(document.querySelector("output")).not.toBeNull();
    });
  });
});
