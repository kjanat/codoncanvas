/**
 * Tests for useKeyboardShortcuts hook
 *
 * Tests keyboard shortcut handling and formatting.
 */

import { describe, expect, mock, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import {
  formatShortcut,
  useKeyboardShortcuts,
} from "@/hooks/useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  describe("shortcut matching", () => {
    test("calls handler on matching key", () => {
      const handler = mock(() => {});

      renderHook(() =>
        useKeyboardShortcuts([{ key: "s", ctrl: true, handler }]),
      );

      // Simulate Ctrl+S
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    test("does not call handler on non-matching key", () => {
      const handler = mock(() => {});

      renderHook(() =>
        useKeyboardShortcuts([{ key: "s", ctrl: true, handler }]),
      );

      // Simulate just "s" without Ctrl
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: false,
        bubbles: true,
      });
      window.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
    });

    test("handles Shift modifier", () => {
      const handler = mock(() => {});

      renderHook(() =>
        useKeyboardShortcuts([{ key: "z", ctrl: true, shift: true, handler }]),
      );

      // Simulate Ctrl+Shift+Z
      const event = new KeyboardEvent("keydown", {
        key: "z",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    test("handles Alt modifier", () => {
      const handler = mock(() => {});

      renderHook(() =>
        useKeyboardShortcuts([{ key: "p", alt: true, handler }]),
      );

      // Simulate Alt+P
      const event = new KeyboardEvent("keydown", {
        key: "p",
        altKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    test("handles special keys", () => {
      const handler = mock(() => {});

      renderHook(() => useKeyboardShortcuts([{ key: "Escape", handler }]));

      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe("enabled option", () => {
    test("does not call handler when disabled", () => {
      const handler = mock(() => {});

      renderHook(() =>
        useKeyboardShortcuts([{ key: "s", ctrl: true, handler }], {
          enabled: false,
        }),
      );

      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    test("removes event listener on unmount", () => {
      const handler = mock(() => {});

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts([{ key: "s", ctrl: true, handler }]),
      );

      unmount();

      // Should not call handler after unmount
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
    });
  });
});

describe("formatShortcut", () => {
  test("formats Ctrl+S", () => {
    const result = formatShortcut({ key: "s", ctrl: true, handler: () => {} });

    // On non-Mac, should be "Ctrl+S"
    expect(result).toContain("S");
  });

  test("formats Ctrl+Shift+Z", () => {
    const result = formatShortcut({
      key: "z",
      ctrl: true,
      shift: true,
      handler: () => {},
    });

    expect(result).toContain("Shift");
    expect(result).toContain("Z");
  });

  test("formats Alt+P", () => {
    const result = formatShortcut({ key: "p", alt: true, handler: () => {} });

    expect(result).toContain("P");
  });

  test("formats special keys", () => {
    const result = formatShortcut({ key: "Escape", handler: () => {} });

    expect(result).toBe("Escape");
  });

  test("capitalizes single letter keys", () => {
    const result = formatShortcut({ key: "a", handler: () => {} });

    expect(result).toBe("A");
  });
});
