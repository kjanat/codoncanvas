/**
 * Tests for ThemeContext
 */

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { ThemeProvider, useTheme } from "@/contexts";

// Wrapper for hook tests
function wrapper({ children }: { children: ReactNode }) {
  return createElement(ThemeProvider, null, children);
}

describe("ThemeContext", () => {
  const originalMatchMedia = window.matchMedia;

  // Mutable version of MediaQueryList for testing
  type MutableMediaQueryList = {
    -readonly [K in keyof MediaQueryList]: MediaQueryList[K];
  };

  let mockMediaQueryList: MutableMediaQueryList;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock matchMedia with full MediaQueryList interface
    mockMediaQueryList = {
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      addListener: mock(() => {}),
      removeListener: mock(() => {}),
      dispatchEvent: mock(() => true),
    };

    window.matchMedia = mock(
      () => mockMediaQueryList,
    ) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
  });

  describe("useTheme", () => {
    test("throws error when used outside ThemeProvider", () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow("useTheme must be used within a ThemeProvider");
    });

    test("returns default theme as system", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe("system");
    });

    test("resolves system theme to light when prefers-color-scheme is light", () => {
      // matches is already false by default
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.resolvedTheme).toBe("light");
    });

    test("resolves system theme to dark when prefers-color-scheme is dark", () => {
      // Create a new mock with matches: true
      const darkMock = { ...mockMediaQueryList, matches: true };
      window.matchMedia = mock(
        () => darkMock,
      ) as unknown as typeof window.matchMedia;

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.resolvedTheme).toBe("dark");
    });

    test("setTheme updates theme to light", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme("light");
      });

      expect(result.current.theme).toBe("light");
      expect(result.current.resolvedTheme).toBe("light");
    });

    test("setTheme updates theme to dark", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.theme).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });

    test("setTheme persists to localStorage", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme("dark");
      });

      const stored = JSON.parse(
        localStorage.getItem("codoncanvas-preferences") ?? "{}",
      );
      expect(stored.theme).toBe("dark");
    });

    test("cycleTheme cycles through light -> dark -> system", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Start at system, cycle to light
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe("light");

      // Cycle to dark
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe("dark");

      // Cycle back to system
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe("system");
    });

    test("returns correct ThemeIcon for each theme", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // System theme
      expect(result.current.ThemeIcon).toBeDefined();

      act(() => {
        result.current.setTheme("light");
      });
      expect(result.current.ThemeIcon).toBeDefined();

      act(() => {
        result.current.setTheme("dark");
      });
      expect(result.current.ThemeIcon).toBeDefined();
    });

    test("loads theme from localStorage on mount", () => {
      localStorage.setItem(
        "codoncanvas-preferences",
        JSON.stringify({ theme: "dark" }),
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe("dark");
    });

    test("applies theme to DOM", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme("dark");
      });

      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      act(() => {
        result.current.setTheme("light");
      });

      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("localStorage edge cases", () => {
    test("handles invalid JSON in localStorage gracefully", () => {
      localStorage.setItem("codoncanvas-preferences", "not-valid-json");

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should fall back to default
      expect(result.current.theme).toBe("system");
    });

    test("handles missing theme in stored preferences", () => {
      localStorage.setItem(
        "codoncanvas-preferences",
        JSON.stringify({ otherPref: true }),
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe("system");
    });

    test("handles invalid theme value in localStorage", () => {
      localStorage.setItem(
        "codoncanvas-preferences",
        JSON.stringify({ theme: "invalid-theme" }),
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should fall back to default
      expect(result.current.theme).toBe("system");
    });
  });

  describe("system theme changes", () => {
    test("registers listener for system theme changes when theme is system", () => {
      renderHook(() => useTheme(), { wrapper });

      expect(mockMediaQueryList.addEventListener).toHaveBeenCalled();
    });

    test("removes listener on unmount", () => {
      const { unmount } = renderHook(() => useTheme(), { wrapper });

      unmount();

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled();
    });

    test("updates theme when system preference changes", () => {
      // Capture the event handler
      let mediaChangeHandler: ((e: MediaQueryListEvent) => void) | null = null;
      (mockMediaQueryList as { addEventListener: unknown }).addEventListener =
        mock((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === "change") {
            mediaChangeHandler = handler;
          }
        });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Initial state should be light (matches: false)
      expect(result.current.resolvedTheme).toBe("light");

      // Simulate system theme change to dark
      act(() => {
        if (mediaChangeHandler) {
          mediaChangeHandler({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(result.current.resolvedTheme).toBe("dark");
    });
  });

  describe("cross-tab storage sync", () => {
    test("updates theme when storage event fires with valid theme", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Simulate storage event from another tab
      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "codoncanvas-preferences",
            newValue: JSON.stringify({ theme: "dark" }),
          }),
        );
      });

      expect(result.current.theme).toBe("dark");
    });

    test("ignores storage event with different key", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme("light");
      });

      // Simulate storage event with different key
      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "other-key",
            newValue: JSON.stringify({ theme: "dark" }),
          }),
        );
      });

      expect(result.current.theme).toBe("light");
    });

    test("ignores storage event with null newValue", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme("light");
      });

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "codoncanvas-preferences",
            newValue: null,
          }),
        );
      });

      expect(result.current.theme).toBe("light");
    });

    test("ignores storage event with invalid JSON", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme("light");
      });

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "codoncanvas-preferences",
            newValue: "not-valid-json",
          }),
        );
      });

      expect(result.current.theme).toBe("light");
    });

    test("ignores storage event with invalid theme value", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme("light");
      });

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "codoncanvas-preferences",
            newValue: JSON.stringify({ theme: "invalid-theme" }),
          }),
        );
      });

      expect(result.current.theme).toBe("light");
    });
  });
});
