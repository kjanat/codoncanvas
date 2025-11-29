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

  test("render function is stable across renders", () => {
    const { result, rerender } = renderHook(() => useRenderGenome());

    const firstRender = result.current.render;
    rerender();
    const secondRender = result.current.render;

    expect(firstRender).toBe(secondRender);
  });

  test("renderWithResult function is stable across renders", () => {
    const { result, rerender } = renderHook(() => useRenderGenome());

    const firstRender = result.current.renderWithResult;
    rerender();
    const secondRender = result.current.renderWithResult;

    expect(firstRender).toBe(secondRender);
  });

  test("clear function is stable across renders", () => {
    const { result, rerender } = renderHook(() => useRenderGenome());

    const firstClear = result.current.clear;
    rerender();
    const secondClear = result.current.clear;

    expect(firstClear).toBe(secondClear);
  });
});
