import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Theme, ThemeManager } from "./theme-manager";

// Mock localStorage for Node.js test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

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
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    if (themeManager) {
      themeManager.destroy();
    }
  });

  describe("Initialization", () => {
    it("should initialize with system theme (dark)", () => {
      themeManager = new ThemeManager();
      expect(themeManager.getTheme()).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("should initialize with saved theme from localStorage", () => {
      localStorage.setItem("codoncanvas-theme", "light");
      themeManager = new ThemeManager();
      expect(themeManager.getTheme()).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("should initialize with high-contrast if system prefers high contrast", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-contrast: high)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
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

    it("should set theme manually", () => {
      themeManager.setTheme("light");
      expect(themeManager.getTheme()).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(localStorage.getItem("codoncanvas-theme")).toBe("light");
    });

    it("should cycle themes in correct order", () => {
      themeManager.setTheme("dark");

      expect(themeManager.cycleTheme()).toBe("light");
      expect(themeManager.getTheme()).toBe("light");

      expect(themeManager.cycleTheme()).toBe("high-contrast");
      expect(themeManager.getTheme()).toBe("high-contrast");

      expect(themeManager.cycleTheme()).toBe("dark");
      expect(themeManager.getTheme()).toBe("dark");
    });

    it("should persist theme changes to localStorage", () => {
      themeManager.setTheme("high-contrast");
      expect(localStorage.getItem("codoncanvas-theme")).toBe("high-contrast");

      themeManager.setTheme("light");
      expect(localStorage.getItem("codoncanvas-theme")).toBe("light");
    });

    it("should reset to system theme", () => {
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

    it("should return correct display names", () => {
      expect(themeManager.getThemeDisplayName("dark")).toBe("Dark");
      expect(themeManager.getThemeDisplayName("light")).toBe("Light");
      expect(themeManager.getThemeDisplayName("high-contrast")).toBe(
        "High Contrast",
      );
    });

    it("should return current theme display name when no argument", () => {
      themeManager.setTheme("light");
      expect(themeManager.getThemeDisplayName()).toBe("Light");
    });

    it("should return correct icons", () => {
      expect(themeManager.getThemeIcon("dark")).toBe("🌙");
      expect(themeManager.getThemeIcon("light")).toBe("☀️");
      expect(themeManager.getThemeIcon("high-contrast")).toBe("🔆");
    });

    it("should return current theme icon when no argument", () => {
      themeManager.setTheme("high-contrast");
      expect(themeManager.getThemeIcon()).toBe("🔆");
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid saved theme gracefully", () => {
      localStorage.setItem("codoncanvas-theme", "invalid-theme");
      themeManager = new ThemeManager();
      expect(themeManager.getTheme()).toBe("dark"); // Falls back to system
    });

    it("should handle localStorage failures gracefully", () => {
      // Mock localStorage to throw error
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage full");
        });

      themeManager = new ThemeManager();
      themeManager.setTheme("light");
      expect(themeManager.getTheme()).toBe("light"); // Theme still applies

      setItemSpy.mockRestore();
    });
  });

  describe("System Theme Change Detection", () => {
    it("should respect manual theme selection over system changes", () => {
      themeManager = new ThemeManager();
      themeManager.setTheme("light"); // Manual selection

      // Simulate system theme change event
      const mockEvent = { matches: true } as MediaQueryListEvent;
      (themeManager as any).handleSystemThemeChange(mockEvent);

      // Should not change from manually selected theme
      expect(themeManager.getTheme()).toBe("light");
    });
  });
});
