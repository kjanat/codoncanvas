/**
 * KeyboardShortcutsHelp - Modal overlay showing available keyboard shortcuts
 */

import { useEffect } from "react";
import {
  formatShortcut,
  type KeyboardShortcut,
} from "@/hooks/useKeyboardShortcuts";
import { CloseIcon } from "@/ui/icons";

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({
  shortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  // Close on Escape or ?
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape" || e.key === "?") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const shortcutsWithDescriptions = shortcuts.filter((s) => s.description);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleBackdropKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      aria-labelledby="shortcuts-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
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
            <CloseIcon className="h-5 w-5" />
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
}

export default KeyboardShortcutsHelp;
