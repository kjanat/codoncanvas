/**
 * KeyboardShortcutsHelp - Modal overlay showing available keyboard shortcuts
 */

import { memo, useEffect } from "react";
import {
  formatShortcut,
  type KeyboardShortcut,
} from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp = memo(function KeyboardShortcutsHelp({
  shortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "?") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutsWithDescriptions = shortcuts.filter((s) => s.description);

  return (
    <div
      aria-labelledby="shortcuts-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
    >
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text" id="shortcuts-title">
            Keyboard Shortcuts
          </h2>
          <button
            aria-label="Close shortcuts help"
            className="rounded p-1 text-text-muted hover:bg-bg-light"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        <dl className="space-y-2">
          {shortcutsWithDescriptions.map((shortcut) => (
            <div
              className="flex items-center justify-between"
              key={`${shortcut.key}-${shortcut.ctrl ?? ""}-${shortcut.shift ?? ""}`}
            >
              <dt className="text-sm text-text">{shortcut.description}</dt>
              <dd>
                <kbd className="rounded bg-bg-light px-2 py-1 font-mono text-xs text-text-muted">
                  {formatShortcut(shortcut)}
                </kbd>
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-2">
            <dt className="text-sm text-text">Show this help</dt>
            <dd>
              <kbd className="rounded bg-bg-light px-2 py-1 font-mono text-xs text-text-muted">
                ?
              </kbd>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
});

export default KeyboardShortcutsHelp;
