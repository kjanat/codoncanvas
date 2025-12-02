/**
 * useKeyboardShortcuts - React hook for keyboard shortcut handling
 *
 * Provides a declarative way to register and handle keyboard shortcuts.
 * Supports modifier keys (Ctrl, Alt, Shift, Meta) and prevents default behavior.
 */

import { useCallback, useEffect, useRef } from "react";

/** Keyboard shortcut definition */
export interface KeyboardShortcut {
  /** Key to listen for (e.g., "s", "Enter", "Escape") */
  key: string;
  /** Require Ctrl/Cmd key */
  ctrl?: boolean;
  /** Require Alt key */
  alt?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Meta key (Cmd on Mac) */
  meta?: boolean;
  /** Handler function */
  handler: (event: KeyboardEvent) => void;
  /** Prevent default browser behavior (default: true) */
  preventDefault?: boolean;
  /** Description for help display */
  description?: string;
}

/** Options for useKeyboardShortcuts hook */
export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean;
  /** Target element (default: window) */
  target?: HTMLElement | Window | null;
  /** Event type to listen for (default: "keydown") */
  eventType?: "keydown" | "keyup";
}

/**
 * Normalize key string for comparison
 */
function normalizeKey(key: string): string {
  return key.toLowerCase();
}

/**
 * Check if event matches shortcut definition
 */
function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut,
): boolean {
  const keyMatches = normalizeKey(event.key) === normalizeKey(shortcut.key);
  const ctrlMatches = shortcut.ctrl
    ? event.ctrlKey || event.metaKey
    : !event.ctrlKey && !event.metaKey;
  const altMatches = shortcut.alt ? event.altKey : !event.altKey;
  const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const metaMatches = shortcut.meta ? event.metaKey : true; // Meta is optional extra check

  return (
    keyMatches &&
    ctrlMatches &&
    altMatches &&
    shiftMatches &&
    (shortcut.meta ? metaMatches : true)
  );
}

/**
 * React hook for keyboard shortcut handling.
 *
 * @example
 * ```tsx
 * function Editor({ onSave, onUndo, onRedo }) {
 *   useKeyboardShortcuts([
 *     { key: "s", ctrl: true, handler: onSave, description: "Save" },
 *     { key: "z", ctrl: true, handler: onUndo, description: "Undo" },
 *     { key: "z", ctrl: true, shift: true, handler: onRedo, description: "Redo" },
 *     { key: "Escape", handler: () => console.log("Escape pressed") },
 *   ]);
 *
 *   return <textarea />;
 * }
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {},
): void {
  const { enabled = true, target = null, eventType = "keydown" } = options;

  // Use ref to avoid re-registering on every render
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyEvent = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in input/textarea (unless explicitly handled)
    const target = event.target as HTMLElement;
    const isInput =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;

    for (const shortcut of shortcutsRef.current) {
      if (matchesShortcut(event, shortcut)) {
        // For input fields, only handle shortcuts with modifiers
        if (isInput && !shortcut.ctrl && !shortcut.alt && !shortcut.meta) {
          continue;
        }

        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }

        shortcut.handler(event);
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target ?? window;
    targetElement.addEventListener(eventType, handleKeyEvent as EventListener);

    return () => {
      targetElement.removeEventListener(
        eventType,
        handleKeyEvent as EventListener,
      );
    };
  }, [enabled, target, eventType, handleKeyEvent]);
}

/**
 * Format shortcut for display (e.g., "Ctrl+S", "Cmd+Z")
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const isMac =
    typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  if (shortcut.ctrl) {
    parts.push(isMac ? "Cmd" : "Ctrl");
  }
  if (shortcut.alt) {
    parts.push(isMac ? "Option" : "Alt");
  }
  if (shortcut.shift) {
    parts.push("Shift");
  }
  if (shortcut.meta && !shortcut.ctrl) {
    parts.push(isMac ? "Cmd" : "Win");
  }

  // Capitalize single letters, use key name for special keys
  const keyDisplay =
    shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;

  parts.push(keyDisplay);

  return parts.join("+");
}

export default useKeyboardShortcuts;
