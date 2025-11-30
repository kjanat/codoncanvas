/**
 * useTheme - React hook for theme management
 *
 * Handles theme preference, DOM synchronization, and system preference detection.
 * Wraps usePreferences to provide theme-specific functionality.
 */

import { useCallback, useEffect, useMemo } from "react";

import { MoonIcon, SunIcon, SystemIcon } from "@/ui/icons";

import { usePreferences } from "./usePreferences";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface UseThemeReturn {
  /** Current theme preference (may be 'system') */
  theme: Theme;
  /** Resolved theme after applying system preference */
  resolvedTheme: ResolvedTheme;
  /** Set theme directly */
  setTheme: (theme: Theme) => void;
  /** Cycle through themes: light -> dark -> system */
  cycleTheme: () => void;
  /** Icon component for current theme */
  ThemeIcon: typeof SunIcon;
}

const THEME_ORDER: Theme[] = ["light", "dark", "system"];

/**
 * Resolves 'system' theme to actual light/dark based on OS preference.
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Applies theme to document root element.
 */
function applyThemeToDOM(resolvedTheme: ResolvedTheme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme);

  if (resolvedTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * React hook for managing application theme.
 *
 * @example
 * ```tsx
 * function ThemeButton() {
 *   const { theme, cycleTheme, ThemeIcon } = useTheme();
 *
 *   return (
 *     <button onClick={cycleTheme} title={`Theme: ${theme}`}>
 *       <ThemeIcon />
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): UseThemeReturn {
  const { preferences, setPreference } = usePreferences();
  const theme = preferences.theme;

  // Resolve system theme
  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  }, [theme]);

  // Apply theme to DOM when it changes
  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes when using 'system' preference
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyThemeToDOM(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setPreference("theme", newTheme);
    },
    [setPreference],
  );

  const cycleTheme = useCallback(() => {
    const currentIndex = THEME_ORDER.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[nextIndex]);
  }, [theme, setTheme]);

  // Select appropriate icon
  const ThemeIcon = useMemo(() => {
    switch (theme) {
      case "dark":
        return MoonIcon;
      case "light":
        return SunIcon;
      default:
        return SystemIcon;
    }
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    cycleTheme,
    ThemeIcon,
  };
}
