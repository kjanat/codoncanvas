/**
 * usePreferences - React hook for user preference management
 *
 * Manages app-wide user preferences with localStorage persistence.
 * Includes theme, nucleotide display mode, and editor settings.
 */

import { useCallback, useMemo } from "react";
import type { NucleotideDisplayMode } from "@/playground/nucleotide-display";
import { useLocalStorage } from "./useLocalStorage";

/** User preferences structure */
export interface UserPreferences {
  /** Color theme (light/dark/system) */
  theme: "light" | "dark" | "system";
  /** Nucleotide display mode (dna/rna) */
  nucleotideMode: NucleotideDisplayMode;
  /** Editor font size in pixels */
  editorFontSize: number;
  /** Auto-run genome on change */
  autoRun: boolean;
  /** Show codon reference panel */
  showReference: boolean;
  /** Last selected example key */
  lastExample: string | null;
}

/** Default preferences */
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  nucleotideMode: "DNA",
  editorFontSize: 14,
  autoRun: true,
  showReference: true,
  lastExample: null,
};

const STORAGE_KEY = "codoncanvas-preferences";

/** Return type of usePreferences hook */
export interface UsePreferencesReturn {
  /** Current preferences */
  preferences: UserPreferences;
  /** Update a single preference */
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => void;
  /** Update multiple preferences at once */
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  /** Reset all preferences to defaults */
  resetPreferences: () => void;
}

/**
 * React hook for managing user preferences.
 *
 * @example
 * ```tsx
 * function Settings() {
 *   const { preferences, setPreference, resetPreferences } = usePreferences();
 *
 *   return (
 *     <div>
 *       <select
 *         value={preferences.theme}
 *         onChange={(e) => setPreference('theme', e.target.value as any)}
 *       >
 *         <option value="light">Light</option>
 *         <option value="dark">Dark</option>
 *         <option value="system">System</option>
 *       </select>
 *
 *       <button onClick={resetPreferences}>Reset to Defaults</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    STORAGE_KEY,
    DEFAULT_PREFERENCES,
  );

  // Ensure preferences has all keys (handles upgrades)
  const mergedPreferences = useMemo(
    () => ({
      ...DEFAULT_PREFERENCES,
      ...preferences,
    }),
    [preferences],
  );

  // Set a single preference
  const setPreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setPreferences],
  );

  // Update multiple preferences
  const updatePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      setPreferences((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [setPreferences],
  );

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, [setPreferences]);

  return {
    preferences: mergedPreferences,
    setPreference,
    updatePreferences,
    resetPreferences,
  };
}

export default usePreferences;
