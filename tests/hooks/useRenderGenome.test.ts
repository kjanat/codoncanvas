/**
 * Tests for useRenderGenome hook
 */

import { describe, expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useRenderGenome } from "@/hooks/useRenderGenome";

describe("useRenderGenome", () => {
  test("returns render functions and lexer", () => {
    const { result } = renderHook(() => useRenderGenome());

    expect(result.current.render).toBeDefined();
    expect(result.current.renderWithResult).toBeDefined();
    expect(result.current.clear).toBeDefined();
    expect(result.current.lexer).toBeDefined();
  });

  test("render returns false for null canvas", () => {
    const { result } = renderHook(() => useRenderGenome());

    const success = result.current.render("ATG GGA TAA", null);

    expect(success).toBe(false);
  });

  test("renderWithResult returns error for null canvas", () => {
    const { result } = renderHook(() => useRenderGenome());

    const renderResult = result.current.renderWithResult("ATG GGA TAA", null);

    expect(renderResult.success).toBe(false);
    expect(renderResult.error).toBe("Canvas not available");
  });

  test("clear handles null canvas gracefully", () => {
    const { result } = renderHook(() => useRenderGenome());

    // Should not throw
    expect(() => result.current.clear(null)).not.toThrow();
  });

  test("lexer is memoized across renders", () => {
    const { result, rerender } = renderHook(() => useRenderGenome());

    const firstLexer = result.current.lexer;
    rerender();
    const secondLexer = result.current.lexer;

    expect(firstLexer).toBe(secondLexer);
  });

  test("lexer can tokenize valid genomes", () => {
    const { result } = renderHook(() => useRenderGenome());

    const tokens = result.current.lexer.tokenize("ATG GGA TAA");

    expect(tokens).toBeDefined();
    expect(tokens.length).toBeGreaterThan(0);
  });

  test("render function works correctly after rerender", () => {
    const { result, rerender } = renderHook(() => useRenderGenome());

    // Function should work before rerender
    expect(result.current.render("ATG TAA", null)).toBe(false);

    rerender();

    // Function should still work after rerender
    expect(result.current.render("ATG TAA", null)).toBe(false);
  });

  test("renderWithResult function works correctly after rerender", () => {
    const { result, rerender } = renderHook(() => useRenderGenome());

    expect(result.current.renderWithResult("ATG TAA", null).success).toBe(
      false,
    );

    rerender();

    expect(result.current.renderWithResult("ATG TAA", null).success).toBe(
      false,
    );
  });

  test("clear function works correctly after rerender", () => {
    const { result, rerender } = renderHook(() => useRenderGenome());

    expect(() => result.current.clear(null)).not.toThrow();

    rerender();

    expect(() => result.current.clear(null)).not.toThrow();
  });
});
