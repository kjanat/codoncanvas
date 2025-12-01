/**
 * usePlaygroundShortcuts - Keyboard shortcuts for the Playground
 *
 * Defines and wires up all keyboard shortcuts for the playground.
 */

import { useMemo } from "react";
import { useKeyboardShortcuts } from "@/hooks";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

export interface PlaygroundShortcutHandlers {
  /** Save genome to file */
  handleSave: () => void;
  /** Run/execute genome */
  runGenome: () => void;
  /** Undo last change */
  handleUndo: () => void;
  /** Redo last undone change */
  handleRedo: () => void;
  /** Export canvas as PNG */
  handleExportPNG: () => void;
  /** Copy share link */
  handleShare: () => void;
  /** Toggle nucleotide display mode */
  handleToggleNucleotideMode: () => void;
  /** Toggle reference panel */
  toggleReference: () => void;
  /** Toggle shortcuts help panel */
  toggleShortcutsHelp: () => void;
  /** Close all panels */
  closeAllPanels: () => void;
}

/**
 * Hook that defines and registers playground keyboard shortcuts.
 *
 * @param handlers - Object containing all shortcut handler functions
 * @returns Array of shortcut definitions for display in help UI
 */
export function usePlaygroundShortcuts(
  handlers: PlaygroundShortcutHandlers,
): KeyboardShortcut[] {
  const shortcuts = useMemo<KeyboardShortcut[]>(
    () => [
      {
        key: "s",
        ctrl: true,
        handler: handlers.handleSave,
        description: "Save genome",
        preventDefault: true,
      },
      {
        key: "Enter",
        ctrl: true,
        handler: handlers.runGenome,
        description: "Run genome",
        preventDefault: true,
      },
      {
        key: "z",
        ctrl: true,
        handler: handlers.handleUndo,
        description: "Undo",
        preventDefault: true,
      },
      {
        key: "z",
        ctrl: true,
        shift: true,
        handler: handlers.handleRedo,
        description: "Redo",
        preventDefault: true,
      },
      {
        key: "y",
        ctrl: true,
        handler: handlers.handleRedo,
        description: "Redo",
        preventDefault: true,
      },
      {
        key: "e",
        ctrl: true,
        handler: handlers.handleExportPNG,
        description: "Export PNG",
        preventDefault: true,
      },
      {
        key: "l",
        ctrl: true,
        handler: handlers.handleShare,
        description: "Copy share link",
        preventDefault: true,
      },
      {
        key: "r",
        ctrl: true,
        shift: true,
        handler: handlers.toggleReference,
        description: "Toggle reference",
        preventDefault: true,
      },
      {
        key: "m",
        ctrl: true,
        handler: handlers.handleToggleNucleotideMode,
        description: "Toggle display mode",
        preventDefault: true,
      },
      {
        key: "Escape",
        handler: handlers.closeAllPanels,
        description: "Close panels",
      },
      {
        key: "?",
        handler: handlers.toggleShortcutsHelp,
        description: "Show shortcuts",
        preventDefault: true,
      },
    ],
    [handlers],
  );

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
