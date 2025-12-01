/**
 * usePlaygroundPanels - Panel visibility state management
 *
 * Handles the reference panel and shortcuts help panel state.
 */

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";

export interface UsePlaygroundPanelsReturn {
  /** Whether the codon reference panel is visible */
  showReference: boolean;
  /** Whether the shortcuts help panel is visible */
  showShortcutsHelp: boolean;
  /** Toggle reference panel visibility */
  toggleReference: () => void;
  /** Toggle shortcuts help panel visibility */
  toggleShortcutsHelp: () => void;
  /** Close all panels */
  closeAllPanels: () => void;
  /** Direct setter for reference panel */
  setShowReference: Dispatch<SetStateAction<boolean>>;
  /** Direct setter for shortcuts help panel */
  setShowShortcutsHelp: Dispatch<SetStateAction<boolean>>;
}

/**
 * Hook for managing playground panel visibility.
 */
export function usePlaygroundPanels(): UsePlaygroundPanelsReturn {
  const [showReference, setShowReference] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const toggleReference = useCallback(() => {
    setShowReference((s) => !s);
  }, []);

  const toggleShortcutsHelp = useCallback(() => {
    setShowShortcutsHelp((s) => !s);
  }, []);

  const closeAllPanels = useCallback(() => {
    setShowReference(false);
    setShowShortcutsHelp(false);
  }, []);

  return {
    showReference,
    showShortcutsHelp,
    toggleReference,
    toggleShortcutsHelp,
    closeAllPanels,
    setShowReference,
    setShowShortcutsHelp,
  };
}
