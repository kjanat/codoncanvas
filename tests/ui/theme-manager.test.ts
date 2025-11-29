import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { ThemeManager } from "@/ui/theme-manager";

// happy-dom provides localStorage automatically via bun-test-setup.ts

describe("ThemeManager", () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset DOM
    document.documentElement.removeAttribute("data-theme");

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mock().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: mock(),
        removeListener: mock(),
        addEventListener: mock(),
        removeEventListener: mock(),
        dispatchEvent: mock(),
      })),
    });
  });

  afterEach(() => {
    if (themeManager) {
      themeManager.destroy();
    }
  });

  describe("Initialization", () => {
    test("should initialize with system theme (dark)", () => {
      themeManager = new ThemeManager();
      expect(themeManager.getTheme()).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    test("should initialize with saved theme from localStorage", () => {
      localStorage.setItem("codoncanvas-theme", "light");
      themeManager = new ThemeManager();
      expect(themeManager.getTheme()).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    test("should initialize with high-contrast if system prefers high contrast", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: mock().mockImplementation((query) => ({
          matches: query === "(prefers-contrast: high)",
          media: query,
          onchange: null,
          addListener: mock(),
          removeListener: mock(),
          addEventListener: mock(),
          removeEventListener: mock(),
          dispatchEvent: mock(),
        })),
      });

      themeManager = new ThemeManager();
      expect(themeManager.getTheme()).toBe("high-contrast");
    });
  });

  describe("Theme Management", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    test("should set theme manually", () => {
      themeManager.setTheme("light");
      expect(themeManager.getTheme()).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(localStorage.getItem("codoncanvas-theme")).toBe("light");
    });

    test("should cycle themes in correct order", () => {
      themeManager.setTheme("dark");

      expect(themeManager.cycleTheme()).toBe("light");
      expect(themeManager.getTheme()).toBe("light");

      expect(themeManager.cycleTheme()).toBe("high-contrast");
      expect(themeManager.getTheme()).toBe("high-contrast");

      expect(themeManager.cycleTheme()).toBe("dark");
      expect(themeManager.getTheme()).toBe("dark");
    });

    test("should persist theme changes to localStorage", () => {
      themeManager.setTheme("high-contrast");
      expect(localStorage.getItem("codoncanvas-theme")).toBe("high-contrast");

      themeManager.setTheme("light");
      expect(localStorage.getItem("codoncanvas-theme")).toBe("light");
    });

    test("should reset to system theme", () => {
      themeManager.setTheme("light");
      expect(localStorage.getItem("codoncanvas-theme")).toBe("light");

      themeManager.resetToSystemTheme();
      expect(localStorage.getItem("codoncanvas-theme")).toBeNull();
      expect(themeManager.getTheme()).toBe("dark"); // System default in mock
    });
  });

  describe("Display Names and Icons", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    test("should return correct display names", () => {
      expect(themeManager.getThemeDisplayName("dark")).toBe("Dark");
      expect(themeManager.getThemeDisplayName("light")).toBe("Light");
      expect(themeManager.getThemeDisplayName("high-contrast")).toBe(
        "High Contrast",
      );
    });

    test("should return current theme display name when no argument", () => {
      themeManager.setTheme("light");
      expect(themeManager.getThemeDisplayName()).toBe("Light");
    });

    test("should return correct icons", () => {
      expect(themeManager.getThemeIcon("dark")).toBe("🌙");
      expect(themeManager.getThemeIcon("light")).toBe("☀️");
      expect(themeManager.getThemeIcon("high-contrast")).toBe("🔆");
    });

    test("should return current theme icon when no argument", () => {
      themeManager.setTheme("high-contrast");
      expect(themeManager.getThemeIcon()).toBe("🔆");
    });
  });

  describe("Edge Cases", () => {
    test("should handle invalid saved theme gracefully", () => {
      localStorage.setItem("codoncanvas-theme", "invalid-theme");
      themeManager = new ThemeManager();
      expect(themeManager.getTheme()).toBe("dark"); // Falls back to system
    });

    test("should handle localStorage failures gracefully", () => {
      // Save original setItem
      const originalSetItem = localStorage.setItem;

      // Mock localStorage to throw error
      localStorage.setItem = () => {
        throw new Error("Storage full");
      };

      themeManager = new ThemeManager();
      themeManager.setTheme("light");
      expect(themeManager.getTheme()).toBe("light"); // Theme still applies

      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });

  describe("System Theme Change Detection", () => {
    test("should respect manual theme selection over system changes", () => {
      themeManager = new ThemeManager();
      themeManager.setTheme("light"); // Manual selection

      // Simulate system theme change event
      const mockEvent = { matches: true } as MediaQueryListEvent;
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private method for testing
      (themeManager as any).handleSystemThemeChange(mockEvent);

      // Should not change from manually selected theme
      expect(themeManager.getTheme()).toBe("light");
    });
  });
});
