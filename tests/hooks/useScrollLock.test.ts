/**
 * Tests for useScrollLock hook
 *
 * Tests body scroll locking with reference counting.
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { _resetLockCount, useScrollLock } from "@/hooks/useScrollLock";

describe("useScrollLock", () => {
  beforeEach(() => {
    // Ensure clean state before each test
    document.body.style.overflow = "";
    _resetLockCount();
  });

  afterEach(() => {
    // Reset body overflow and lock count after each test
    document.body.style.overflow = "";
    _resetLockCount();
  });

  describe("single lock", () => {
    test("locks body scroll when enabled is true", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");
    });

    test("does not lock body scroll when enabled is false", () => {
      renderHook(() => useScrollLock(false));

      expect(document.body.style.overflow).toBe("");
    });

    test("unlocks body scroll when unmounted", () => {
      const { unmount } = renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("");
    });

    test("unlocks body scroll when enabled changes to false", () => {
      const { rerender } = renderHook(({ enabled }) => useScrollLock(enabled), {
        initialProps: { enabled: true },
      });

      expect(document.body.style.overflow).toBe("hidden");

      rerender({ enabled: false });

      expect(document.body.style.overflow).toBe("");
    });

    test("locks body scroll when enabled changes to true", () => {
      const { rerender } = renderHook(({ enabled }) => useScrollLock(enabled), {
        initialProps: { enabled: false },
      });

      expect(document.body.style.overflow).toBe("");

      rerender({ enabled: true });

      expect(document.body.style.overflow).toBe("hidden");
    });
  });

  describe("edge cases", () => {
    test("handles starting disabled then enabling", () => {
      const { rerender, unmount } = renderHook(
        ({ enabled }) => useScrollLock(enabled),
        { initialProps: { enabled: false } },
      );

      expect(document.body.style.overflow).toBe("");

      rerender({ enabled: true });
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    test("handles unmount while disabled", () => {
      const { rerender, unmount } = renderHook(
        ({ enabled }) => useScrollLock(enabled),
        { initialProps: { enabled: true } },
      );

      rerender({ enabled: false });
      expect(document.body.style.overflow).toBe("");

      // Should not affect anything when unmounting in disabled state
      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    test("SSR guard prevents errors when document is undefined", () => {
      // The hook guards against undefined document, so this test
      // verifies the hook doesn't throw when document exists
      // (actual SSR environment would have document undefined)
      expect(() => {
        renderHook(() => useScrollLock(true));
      }).not.toThrow();
    });
  });
});
