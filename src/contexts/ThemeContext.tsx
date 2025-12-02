/**
 * ThemeContext - Global theme management
 *
 * Provides a single source of truth for theme state across the app.
 * Uses localStorage for persistence and syncs across tabs.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { MoonIcon, SunIcon, SystemIcon } from "@/ui/icons";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
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

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_ORDER: Theme[] = ["light", "dark", "system"];
const STORAGE_KEY = "codoncanvas-preferences";

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
 * Get initial theme from localStorage.
 */
function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const prefs = JSON.parse(stored);
      if (prefs.theme && ["light", "dark", "system"].includes(prefs.theme)) {
        return prefs.theme;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return "system";
}

/**
 * Save theme to localStorage (preserving other preferences).
 */
function saveTheme(newTheme: Theme): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefs = stored ? JSON.parse(stored) : {};
    prefs.theme = newTheme;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Provides theme management to the app.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Compute resolved theme
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  // Apply theme to DOM on change
  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const prefs = JSON.parse(e.newValue);
          if (
            prefs.theme &&
            ["light", "dark", "system"].includes(prefs.theme)
          ) {
            setThemeState(prefs.theme);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const currentIndex = THEME_ORDER.indexOf(current);
      const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
      const newTheme = THEME_ORDER[nextIndex];
      saveTheme(newTheme);
      return newTheme;
    });
  }, []);

  // Select appropriate icon
  const ThemeIcon =
    theme === "dark" ? MoonIcon : theme === "light" ? SunIcon : SystemIcon;

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    cycleTheme,
    ThemeIcon,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access theme state and controls.
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { resolvedTheme, cycleTheme, ThemeIcon } = useTheme();
 *   return (
 *     <button onClick={cycleTheme}>
 *       <ThemeIcon />
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider. " +
        "Wrap your app with <ThemeProvider> in your root component:\n\n" +
        "  import { ThemeProvider } from '@/contexts';\n\n" +
        "  <ThemeProvider>\n" +
        "    <App />\n" +
        "  </ThemeProvider>",
    );
  }

  return context;
}
