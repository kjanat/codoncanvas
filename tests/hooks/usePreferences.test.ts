/**
 * Tests for usePreferences hook
 *
 * Tests user preferences management with localStorage persistence.
 */

import { afterEach, describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { usePreferences } from "@/hooks/usePreferences";

describe("usePreferences", () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    test("returns default preferences", () => {
      const { result } = renderHook(() => usePreferences());

      expect(result.current.preferences.theme).toBe("system");
      expect(result.current.preferences.nucleotideMode).toBe("DNA");
      expect(result.current.preferences.editorFontSize).toBe(14);
      expect(result.current.preferences.autoRun).toBe(true);
      expect(result.current.preferences.showReference).toBe(true);
      expect(result.current.preferences.lastExample).toBeNull();
    });
  });

  describe("setPreference", () => {
    test("updates single preference", () => {
      const { result } = renderHook(() => usePreferences());

      act(() => {
        result.current.setPreference("theme", "dark");
      });

      expect(result.current.preferences.theme).toBe("dark");
    });

    test("persists to localStorage", () => {
      const { result } = renderHook(() => usePreferences());

      act(() => {
        result.current.setPreference("editorFontSize", 18);
      });

      // Re-render hook to check persistence
      const { result: result2 } = renderHook(() => usePreferences());

      expect(result2.current.preferences.editorFontSize).toBe(18);
    });

    test("preserves other preferences", () => {
      const { result } = renderHook(() => usePreferences());

      act(() => {
        result.current.setPreference("theme", "light");
        result.current.setPreference("editorFontSize", 16);
      });

      expect(result.current.preferences.theme).toBe("light");
      expect(result.current.preferences.editorFontSize).toBe(16);
      expect(result.current.preferences.autoRun).toBe(true);
    });
  });

  describe("updatePreferences", () => {
    test("updates multiple preferences at once", () => {
      const { result } = renderHook(() => usePreferences());

      act(() => {
        result.current.updatePreferences({
          theme: "dark",
          editorFontSize: 20,
          autoRun: false,
        });
      });

      expect(result.current.preferences.theme).toBe("dark");
      expect(result.current.preferences.editorFontSize).toBe(20);
      expect(result.current.preferences.autoRun).toBe(false);
    });
  });

  describe("resetPreferences", () => {
    test("resets all preferences to defaults", () => {
      const { result } = renderHook(() => usePreferences());

      // Change some preferences
      act(() => {
        result.current.updatePreferences({
          theme: "dark",
          editorFontSize: 20,
          autoRun: false,
        });
      });

      // Reset
      act(() => {
        result.current.resetPreferences();
      });

      expect(result.current.preferences.theme).toBe("system");
      expect(result.current.preferences.editorFontSize).toBe(14);
      expect(result.current.preferences.autoRun).toBe(true);
    });
  });

  describe("preference types", () => {
    test("handles theme preference", () => {
      const { result } = renderHook(() => usePreferences());

      act(() => {
        result.current.setPreference("theme", "light");
      });
      expect(result.current.preferences.theme).toBe("light");

      act(() => {
        result.current.setPreference("theme", "dark");
      });
      expect(result.current.preferences.theme).toBe("dark");

      act(() => {
        result.current.setPreference("theme", "system");
      });
      expect(result.current.preferences.theme).toBe("system");
    });

    test("handles nucleotideMode preference", () => {
      const { result } = renderHook(() => usePreferences());

      act(() => {
        result.current.setPreference("nucleotideMode", "RNA");
      });
      expect(result.current.preferences.nucleotideMode).toBe("RNA");

      act(() => {
        result.current.setPreference("nucleotideMode", "DNA");
      });
      expect(result.current.preferences.nucleotideMode).toBe("DNA");
    });

    test("handles lastExample preference", () => {
      const { result } = renderHook(() => usePreferences());

      act(() => {
        result.current.setPreference("lastExample", "helloCircle");
      });
      expect(result.current.preferences.lastExample).toBe("helloCircle");

      act(() => {
        result.current.setPreference("lastExample", null);
      });
      expect(result.current.preferences.lastExample).toBeNull();
    });
  });
});
