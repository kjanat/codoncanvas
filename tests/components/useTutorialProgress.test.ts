/**
 * Tests for useTutorialProgress hook
 */

import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useTutorialProgress } from "@/components/tutorial/useTutorialProgress";

describe("useTutorialProgress", () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    test("returns default progress when no stored data", () => {
      const { result } = renderHook(() => useTutorialProgress());

      expect(result.current.progress.completedLessons).toEqual([]);
      expect(result.current.progress.currentLesson).toBe("basics-1");
    });

    test("returns currentLesson object", () => {
      const { result } = renderHook(() => useTutorialProgress());

      expect(result.current.currentLesson).not.toBeNull();
      expect(result.current.currentLesson?.id).toBe("basics-1");
    });

    test("calculates progressPercent correctly", () => {
      const { result } = renderHook(() => useTutorialProgress());

      expect(result.current.progressPercent).toBe(0);
      expect(result.current.totalLessons).toBeGreaterThan(0);
    });
  });

  describe("selectLesson", () => {
    test("updates currentLesson when valid ID provided", () => {
      const { result } = renderHook(() => useTutorialProgress());

      act(() => {
        result.current.selectLesson("basics-2");
      });

      expect(result.current.progress.currentLesson).toBe("basics-2");
    });

    test("does not update when invalid ID provided", () => {
      const warnSpy = mock(() => {});
      const originalWarn = console.warn;
      console.warn = warnSpy;

      const { result } = renderHook(() => useTutorialProgress());

      act(() => {
        result.current.selectLesson("nonexistent-lesson");
      });

      expect(result.current.progress.currentLesson).toBe("basics-1");
      expect(warnSpy).toHaveBeenCalledWith(
        "Invalid lesson ID: nonexistent-lesson",
      );

      console.warn = originalWarn;
    });

    test("does not update for empty string ID", () => {
      const warnSpy = mock(() => {});
      const originalWarn = console.warn;
      console.warn = warnSpy;

      const { result } = renderHook(() => useTutorialProgress());

      act(() => {
        result.current.selectLesson("");
      });

      expect(result.current.progress.currentLesson).toBe("basics-1");
      expect(warnSpy).toHaveBeenCalled();

      console.warn = originalWarn;
    });
  });

  describe("completeLesson", () => {
    test("adds lesson to completedLessons", () => {
      const { result } = renderHook(() => useTutorialProgress());

      act(() => {
        result.current.completeLesson("basics-1");
      });

      expect(result.current.progress.completedLessons).toContain("basics-1");
    });

    test("does not duplicate completed lessons", () => {
      const { result } = renderHook(() => useTutorialProgress());

      act(() => {
        result.current.completeLesson("basics-1");
        result.current.completeLesson("basics-1");
      });

      const count = result.current.progress.completedLessons.filter(
        (id) => id === "basics-1",
      ).length;
      expect(count).toBe(1);
    });

    test("updates progressPercent when lesson completed", () => {
      const { result } = renderHook(() => useTutorialProgress());

      const initialPercent = result.current.progressPercent;

      act(() => {
        result.current.completeLesson("basics-1");
      });

      expect(result.current.progressPercent).toBeGreaterThan(initialPercent);
    });
  });

  describe("hints tracking", () => {
    test("recordHintUsed stores hint count", () => {
      const { result } = renderHook(() => useTutorialProgress());

      act(() => {
        result.current.recordHintUsed("basics-1", 2);
      });

      expect(result.current.getHintsUsed("basics-1")).toBe(2);
    });

    test("getHintsUsed returns 0 for untracked lessons", () => {
      const { result } = renderHook(() => useTutorialProgress());

      expect(result.current.getHintsUsed("untracked-lesson")).toBe(0);
    });
  });
});
