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
const MENU_ITEM_COUNT = 6;

export function OverflowMenu({ io, history }: OverflowMenuProps): JSX.Element {
  const triggerId = useId();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Move focus to first menu item when opened
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
      menuItemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextIndex = (focusedIndex + 1) % MENU_ITEM_COUNT;
          setFocusedIndex(nextIndex);
          menuItemRefs.current[nextIndex]?.focus();
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prevIndex =
            (focusedIndex - 1 + MENU_ITEM_COUNT) % MENU_ITEM_COUNT;
          setFocusedIndex(prevIndex);
          menuItemRefs.current[prevIndex]?.focus();
          break;
        }
        case "Home": {
          e.preventDefault();
          setFocusedIndex(0);
          menuItemRefs.current[0]?.focus();
          break;
        }
        case "End": {
          e.preventDefault();
          const lastIndex = MENU_ITEM_COUNT - 1;
          setFocusedIndex(lastIndex);
          menuItemRefs.current[lastIndex]?.focus();
          break;
        }
      }
    },
    [focusedIndex],
  );

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
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-text hover:bg-bg-light"
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
            aria-labelledby={triggerId}
            className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg"
            id={menuId}
            onKeyDown={handleMenuKeyDown}
            ref={menuRef}
            role="menu"
          >
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light"
              data-testid="mobile-menu-load"
              onClick={() => fileInputRef.current?.click()}
              ref={(el) => {
                menuItemRefs.current[0] = el;
              }}
              role="menuitem"
              tabIndex={focusedIndex === 0 ? 0 : -1}
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
              ref={(el) => {
                menuItemRefs.current[1] = el;
              }}
              role="menuitem"
              tabIndex={focusedIndex === 1 ? 0 : -1}
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
              ref={(el) => {
                menuItemRefs.current[2] = el;
              }}
              role="menuitem"
              tabIndex={focusedIndex === 2 ? 0 : -1}
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
              ref={(el) => {
                menuItemRefs.current[3] = el;
              }}
              role="menuitem"
              tabIndex={focusedIndex === 3 ? 0 : -1}
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
              ref={(el) => {
                menuItemRefs.current[4] = el;
              }}
              role="menuitem"
              tabIndex={focusedIndex === 4 ? 0 : -1}
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
              ref={(el) => {
                menuItemRefs.current[5] = el;
              }}
              role="menuitem"
              tabIndex={focusedIndex === 5 ? 0 : -1}
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
