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

  describe("reference counting", () => {
    test("maintains lock until all holders release", () => {
      // Mount two concurrent hooks with enabled=true
      const hook1 = renderHook(() => useScrollLock(true));
      const hook2 = renderHook(() => useScrollLock(true));

      // Body should be locked
      expect(document.body.style.overflow).toBe("hidden");

      // Unmount first hook - body should still be locked
      hook1.unmount();
      expect(document.body.style.overflow).toBe("hidden");

      // Unmount second hook - body should now be unlocked
      hook2.unmount();
      expect(document.body.style.overflow).toBe("");
    });

    test("handles mixed enable states across multiple holders", () => {
      const hook1 = renderHook(({ enabled }) => useScrollLock(enabled), {
        initialProps: { enabled: true },
      });
      const hook2 = renderHook(({ enabled }) => useScrollLock(enabled), {
        initialProps: { enabled: true },
      });

      expect(document.body.style.overflow).toBe("hidden");

      // Disable first hook - second still holds lock
      hook1.rerender({ enabled: false });
      expect(document.body.style.overflow).toBe("hidden");

      // Disable second hook - no more holders
      hook2.rerender({ enabled: false });
      expect(document.body.style.overflow).toBe("");
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

    test("does not throw when called in browser environment", () => {
      // Note: The hook has an SSR guard (typeof document === "undefined")
      // but renderHook itself requires document, so we can only verify
      // non-throwing behavior in a browser-like environment here.
      expect(() => {
        renderHook(() => useScrollLock(true));
      }).not.toThrow();
    });
  });
});
