/**
 * PlaygroundOverflowMenu - Mobile overflow menu for toolbar actions
 */

import {
  type JSX,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  CheckIcon,
  CopyIcon,
  DotsVerticalIcon,
  RedoIcon,
  SaveIcon,
  ShareIcon,
  UndoIcon,
  UploadIcon,
} from "@/ui/icons";

import type { ToolbarHistoryProps, ToolbarIOProps } from "./PlaygroundToolbar";

interface OverflowMenuProps {
  io: ToolbarIOProps;
  history: ToolbarHistoryProps;
}

/** Overflow menu for mobile */
export function OverflowMenu({ io, history }: OverflowMenuProps): JSX.Element {
  const triggerId = useId();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Move focus to menu when opened, restore to trigger when closed
  useEffect(() => {
    if (isOpen) {
      menuRef.current?.focus();
    }
  }, [isOpen]);

  // Global Escape key listener for keyboard accessibility
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, closeMenu]);

  return (
    <div className="relative md:hidden">
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="More actions"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text hover:bg-bg-light"
        id={triggerId}
        onClick={() => setIsOpen(!isOpen)}
        ref={triggerRef}
        type="button"
      >
        <DotsVerticalIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40"
            onClick={closeMenu}
          />
          <div
            className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg"
            id={menuId}
            ref={menuRef}
            tabIndex={-1}
          >
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light"
              data-testid="mobile-menu-load"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <UploadIcon className="h-4 w-4" />
              Load file
            </button>
            <input
              accept=".genome,.txt"
              aria-label="Load genome file"
              className="hidden"
              data-testid="mobile-menu-load-input"
              onChange={(e) => {
                io.onLoad(e);
                setIsOpen(false);
              }}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light"
              data-testid="mobile-menu-save"
              onClick={() => {
                io.onSave();
                setIsOpen(false);
              }}
              type="button"
            >
              <SaveIcon className="h-4 w-4" />
              Save
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light"
              data-testid="mobile-menu-copy"
              onClick={() => {
                io.onCopy();
                setIsOpen(false);
              }}
              type="button"
            >
              {io.copied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
              {io.copied ? "Copied!" : "Copy"}
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light"
              data-testid="mobile-menu-share"
              onClick={() => {
                io.onShare();
                setIsOpen(false);
              }}
              type="button"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </button>
            <hr className="my-1 border-border" />
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light disabled:opacity-40"
              data-testid="mobile-menu-undo"
              disabled={!history.canUndo}
              onClick={() => {
                history.onUndo();
                setIsOpen(false);
              }}
              type="button"
            >
              <UndoIcon className="h-4 w-4" />
              Undo
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light disabled:opacity-40"
              data-testid="mobile-menu-redo"
              disabled={!history.canRedo}
              onClick={() => {
                history.onRedo();
                setIsOpen(false);
              }}
              type="button"
            >
              <RedoIcon className="h-4 w-4" />
              Redo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
