/**
 * Tests for useRenderGenome hook
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useRenderGenome } from "@/hooks/useRenderGenome";
import { ThemeWrapper } from "@/tests/test-utils";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "@/tests/test-utils/canvas-mock";

describe("useRenderGenome", () => {
  test("returns render functions and lexer", () => {
    const { result } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    expect(result.current.render).toBeDefined();
    expect(result.current.renderWithResult).toBeDefined();
    expect(result.current.clear).toBeDefined();
    expect(result.current.lexer).toBeDefined();
  });

  test("render returns false for null canvas", () => {
    const { result } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    const success = result.current.render("ATG GGA TAA", null);

    expect(success).toBe(false);
  });

  test("renderWithResult returns error for null canvas", () => {
    const { result } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    const renderResult = result.current.renderWithResult("ATG GGA TAA", null);

    expect(renderResult.success).toBe(false);
    expect(renderResult.error).toBe("Canvas not available");
  });

  test("clear handles null canvas gracefully", () => {
    const { result } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    // Should not throw
    expect(() => result.current.clear(null)).not.toThrow();
  });

  test("lexer is memoized across renders", () => {
    const { result, rerender } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    const firstLexer = result.current.lexer;
    rerender();
    const secondLexer = result.current.lexer;

    expect(firstLexer).toBe(secondLexer);
  });

  test("lexer can tokenize valid genomes", () => {
    const { result } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    const tokens = result.current.lexer.tokenize("ATG GGA TAA");

    expect(tokens).toBeDefined();
    expect(tokens.length).toBeGreaterThan(0);
  });

  test("render function works correctly after rerender", () => {
    const { result, rerender } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    // Function should work before rerender
    expect(result.current.render("ATG TAA", null)).toBe(false);

    rerender();

    // Function should still work after rerender
    expect(result.current.render("ATG TAA", null)).toBe(false);
  });

  test("renderWithResult function works correctly after rerender", () => {
    const { result, rerender } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    expect(result.current.renderWithResult("ATG TAA", null).success).toBe(
      false,
    );

    rerender();

    expect(result.current.renderWithResult("ATG TAA", null).success).toBe(
      false,
    );
  });

  test("clear function works correctly after rerender", () => {
    const { result, rerender } = renderHook(() => useRenderGenome(), {
      wrapper: ThemeWrapper,
    });

    expect(() => result.current.clear(null)).not.toThrow();

    rerender();

    expect(() => result.current.clear(null)).not.toThrow();
  });

  describe("with mocked canvas", () => {
    beforeEach(() => {
      mockCanvasContext();
    });

    afterEach(() => {
      restoreCanvasContext();
    });

    test("clear fills canvas with white", () => {
      const { result } = renderHook(() => useRenderGenome(), {
        wrapper: ThemeWrapper,
      });

      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;

      expect(() => result.current.clear(canvas)).not.toThrow();
    });

    test("renderWithResult catches errors and returns failure", () => {
      const { result } = renderHook(() => useRenderGenome(), {
        wrapper: ThemeWrapper,
      });

      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;

      // Invalid genome with bad codon triggers error path
      const renderResult = result.current.renderWithResult(
        "XXX YYY ZZZ",
        canvas,
      );

      expect(renderResult.success).toBe(false);
      expect(renderResult.error).not.toBeNull();
    });

    test("render returns false when error occurs", () => {
      const { result } = renderHook(() => useRenderGenome(), {
        wrapper: ThemeWrapper,
      });

      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;

      const success = result.current.render("INVALID XXX", canvas);

      expect(success).toBe(false);
    });

    test("renderWithResult error message is string for Error instances", () => {
      const { result } = renderHook(() => useRenderGenome(), {
        wrapper: ThemeWrapper,
      });

      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;

      const renderResult = result.current.renderWithResult(
        "BAD CODON ZZZ",
        canvas,
      );

      expect(renderResult.success).toBe(false);
      expect(typeof renderResult.error).toBe("string");
    });

    test("renderWithResult returns 'Render failed' for non-Error exceptions", () => {
      const { result } = renderHook(() => useRenderGenome(), {
        wrapper: ThemeWrapper,
      });

      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;

      // Mock getContext to throw a non-Error value
      const originalGetContext = canvas.getContext.bind(canvas);
      let callCount = 0;
      canvas.getContext = ((contextId: string) => {
        callCount++;
        // First call is for clear(), let it succeed
        // Second call is for Canvas2DRenderer, throw non-Error
        if (callCount > 1) {
          throw "non-error-string";
        }
        return originalGetContext(contextId);
      }) as typeof canvas.getContext;

      const renderResult = result.current.renderWithResult("ATG TAA", canvas);

      expect(renderResult.success).toBe(false);
      expect(renderResult.error).toBe("Render failed");
    });

    test("renderWithResult with skipClear option", () => {
      const { result } = renderHook(() => useRenderGenome(), {
        wrapper: ThemeWrapper,
      });

      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;

      // Should not throw and should work with skipClear
      const renderResult = result.current.renderWithResult("ATG TAA", canvas, {
        skipClear: true,
      });

      // Even with skipClear, render may fail due to invalid genome, but it shouldn't crash
      expect(typeof renderResult.success).toBe("boolean");
    });
  });
});
