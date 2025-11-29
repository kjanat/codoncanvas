/**
 * Tests for useGenome hook
 *
 * Tests genome state management, validation, and debouncing behavior.
 */

import { describe, expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useGenome } from "@/hooks/useGenome";

describe("useGenome", () => {
  describe("initialization", () => {
    test("initializes with default genome", () => {
      const { result } = renderHook(() => useGenome());

      expect(result.current.genome).toBe("ATG GAA AAT GGA TAA");
    });

    test("initializes with custom genome", () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "ATG GGA TAA" }),
      );

      expect(result.current.genome).toBe("ATG GGA TAA");
    });

    test("provides lexer instance", () => {
      const { result } = renderHook(() => useGenome());

      expect(result.current.lexer).toBeDefined();
      expect(typeof result.current.lexer.tokenize).toBe("function");
    });

    test("validates on mount", async () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "ATG GGA TAA" }),
      );

      // Wait for initial validation
      await waitFor(() => {
        expect(result.current.validation.isValid).toBe(true);
      });
    });
  });

  describe("setGenome", () => {
    test("updates genome value", () => {
      const { result } = renderHook(() => useGenome());

      act(() => {
        result.current.setGenome("ATG CCC TAA");
      });

      expect(result.current.genome).toBe("ATG CCC TAA");
    });

    test("sets isPending during debounce", () => {
      const { result } = renderHook(() => useGenome({ debounceMs: 100 }));

      act(() => {
        result.current.setGenome("ATG CCC TAA");
      });

      expect(result.current.isPending).toBe(true);
    });

    // Skipped: Bun's fake timer API (vi.advanceTimersByTime) is not available
    test.skip("clears isPending after debounce", async () => {
      // Would test that isPending becomes false after debounce timeout
    });
  });

  describe("validation", () => {
    test("validates valid genome", () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "ATG GGA TAA", autoValidate: false }),
      );

      act(() => {
        result.current.validate();
      });

      expect(result.current.validation.isValid).toBe(true);
      expect(result.current.validation.errors).toHaveLength(0);
      expect(result.current.validation.tokens.length).toBeGreaterThan(0);
    });

    test("detects missing START codon", () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "GGA TAA", autoValidate: false }),
      );

      act(() => {
        result.current.validate();
      });

      expect(result.current.validation.isValid).toBe(false);
      expect(result.current.validation.errors.length).toBeGreaterThan(0);
    });

    test("detects missing STOP codon", () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "ATG GGA CCC", autoValidate: false }),
      );

      act(() => {
        result.current.validate();
      });

      // Missing STOP is typically a warning, not an error
      expect(result.current.validation.warnings.length).toBeGreaterThan(0);
    });

    test("captures tokenization errors", () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "XYZ INVALID", autoValidate: false }),
      );

      act(() => {
        result.current.validate();
      });

      // Either errors or tokenizeError should be set
      const hasError =
        result.current.validation.errors.length > 0 ||
        result.current.validation.tokenizeError !== null;
      expect(hasError).toBe(true);
    });

    test("returns validation result from validate()", () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "ATG TAA", autoValidate: false }),
      );

      let validationResult:
        | ReturnType<typeof result.current.validate>
        | undefined;
      act(() => {
        validationResult = result.current.validate();
      });

      expect(validationResult).toBeDefined();
      expect(validationResult?.isValid).toBe(true);
    });
  });

  describe("clear and reset", () => {
    test("clear sets genome to empty string", () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "ATG GGA TAA" }),
      );

      act(() => {
        result.current.clear();
      });

      expect(result.current.genome).toBe("");
    });

    test("reset restores initial genome", () => {
      const initialGenome = "ATG GGA TAA";
      const { result } = renderHook(() => useGenome({ initialGenome }));

      act(() => {
        result.current.setGenome("ATG CCC TAA");
      });

      expect(result.current.genome).toBe("ATG CCC TAA");

      act(() => {
        result.current.reset();
      });

      expect(result.current.genome).toBe(initialGenome);
    });
  });

  describe("autoValidate option", () => {
    test("validates automatically when enabled", async () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "ATG TAA", autoValidate: true }),
      );

      await waitFor(() => {
        expect(result.current.validation.isValid).toBe(true);
      });
    });

    test("does not auto-validate when disabled (manual validate needed)", () => {
      const { result } = renderHook(() =>
        useGenome({ initialGenome: "ATG TAA", autoValidate: false }),
      );

      // Without calling validate(), tokens should be empty
      // Note: initial useEffect still runs once on mount
      // So we test by checking that setting genome doesn't trigger validation
      act(() => {
        result.current.setGenome("ATG GGA TAA");
      });

      // The new genome hasn't been validated yet (no auto-validate)
      // isPending should be false since autoValidate is false
      expect(result.current.isPending).toBe(false);
    });
  });

  describe("debounce behavior", () => {
    test("debounces multiple rapid changes", () => {
      const { result } = renderHook(() => useGenome({ debounceMs: 100 }));

      act(() => {
        result.current.setGenome("ATG");
        result.current.setGenome("ATG GGA");
        result.current.setGenome("ATG GGA TAA");
      });

      // Should still be pending
      expect(result.current.isPending).toBe(true);
      expect(result.current.genome).toBe("ATG GGA TAA");
    });

    // Skipped: Bun's fake timer API (vi.advanceTimersByTime) is not available
    test.skip("respects custom debounce delay", () => {
      // Would test that debounce respects custom delay
    });
  });
});
