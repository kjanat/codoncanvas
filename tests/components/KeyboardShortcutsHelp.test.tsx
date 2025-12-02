import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

afterEach(() => cleanup());

const mockShortcuts: KeyboardShortcut[] = [
  { key: "s", ctrl: true, handler: () => {}, description: "Save" },
  { key: "z", ctrl: true, handler: () => {}, description: "Undo" },
  { key: "z", ctrl: true, shift: true, handler: () => {}, description: "Redo" },
  { key: "Escape", handler: () => {} }, // No description - should be filtered out
];

describe("KeyboardShortcutsHelp", () => {
  describe("closed state", () => {
    test("returns null when isOpen is false", () => {
      const onClose = mock(() => {});
      const { container } = render(
        <KeyboardShortcutsHelp
          isOpen={false}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      expect(container.innerHTML).toBe("");
    });

    test("no modal in DOM when closed", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={false}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("open state rendering", () => {
    test("renders dialog with role='dialog' and aria-modal='true'", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    test("renders heading 'Keyboard Shortcuts' with correct id", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const heading = screen.getByText("Keyboard Shortcuts");
      expect(heading).toBeDefined();
      expect(heading.tagName).toBe("H2");
      expect(heading.id).toBe("shortcuts-title");
    });

    test("dialog has aria-labelledby pointing to heading", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-labelledby")).toBe("shortcuts-title");
    });

    test("renders close button with aria-label='Close shortcuts help'", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const closeButton = screen.getByLabelText("Close shortcuts help");
      expect(closeButton).toBeDefined();
      expect(closeButton.tagName).toBe("BUTTON");
    });
  });

  describe("shortcut filtering", () => {
    test("only shows shortcuts with description property", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      expect(screen.getByText("Save")).toBeDefined();
      expect(screen.getByText("Undo")).toBeDefined();
      expect(screen.getByText("Redo")).toBeDefined();
    });

    test("shortcuts without description are filtered out", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      // The Escape shortcut without description should not appear
      // We can verify by counting the shortcuts displayed
      const dtElements = screen.getAllByRole("term");
      // 3 shortcuts with descriptions + 1 "Show this help" = 4
      expect(dtElements.length).toBe(4);
    });

    test("always shows 'Show this help' with '?' at bottom", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      expect(screen.getByText("Show this help")).toBeDefined();
      expect(screen.getByText("?")).toBeDefined();
    });

    test("shows 'Show this help' even with empty shortcuts array", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={[]}
        />,
      );

      expect(screen.getByText("Show this help")).toBeDefined();
      expect(screen.getByText("?")).toBeDefined();
    });
  });

  describe("shortcut display", () => {
    test("description is in <dt> element", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const saveDesc = screen.getByText("Save");
      expect(saveDesc.tagName).toBe("DT");
    });

    test("formatted key is in <kbd> element", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      // formatShortcut produces "Ctrl+S" (or "Cmd+S" on Mac)
      const kbdElements = screen.getAllByRole("definition");
      expect(kbdElements.length).toBeGreaterThan(0);

      // Each dd should contain a kbd
      for (const dd of kbdElements) {
        const kbd = dd.querySelector("kbd");
        expect(kbd).not.toBeNull();
      }
    });

    test("uses real formatShortcut function for key display", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={[
            { key: "s", ctrl: true, handler: () => {}, description: "Save" },
          ]}
        />,
      );

      // Should show Ctrl+S (or Cmd+S on Mac)
      const kbdElements = document.querySelectorAll("kbd");
      const keyTexts = Array.from(kbdElements).map((kbd) => kbd.textContent);
      // At least one should match Ctrl+S or Cmd+S
      const hasSaveShortcut = keyTexts.some(
        (text) => text === "Ctrl+S" || text === "Cmd+S",
      );
      expect(hasSaveShortcut).toBe(true);
    });

    test("displays shift modifier in formatted shortcut", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={[
            {
              key: "z",
              ctrl: true,
              shift: true,
              handler: () => {},
              description: "Redo",
            },
          ]}
        />,
      );

      const kbdElements = document.querySelectorAll("kbd");
      const keyTexts = Array.from(kbdElements).map((kbd) => kbd.textContent);
      // Should contain Shift in the formatted shortcut
      const hasRedoShortcut = keyTexts.some(
        (text) =>
          (text?.includes("Ctrl") || text?.includes("Cmd")) &&
          text?.includes("Shift") &&
          text?.includes("Z"),
      );
      expect(hasRedoShortcut).toBe(true);
    });
  });

  describe("close behaviors", () => {
    test("close button click calls onClose", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const closeButton = screen.getByLabelText("Close shortcuts help");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("Escape key calls onClose", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      fireEvent.keyDown(window, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("'?' key calls onClose", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      fireEvent.keyDown(window, { key: "?" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("backdrop click calls onClose", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const backdrop = screen.getByRole("dialog");
      fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("click inside modal content does NOT call onClose", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const heading = screen.getByText("Keyboard Shortcuts");
      fireEvent.click(heading);

      expect(onClose).toHaveBeenCalledTimes(0);
    });

    test("click on shortcut description does NOT call onClose", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const saveText = screen.getByText("Save");
      fireEvent.click(saveText);

      expect(onClose).toHaveBeenCalledTimes(0);
    });

    test("Escape keydown on backdrop calls onClose", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const backdrop = screen.getByRole("dialog");
      fireEvent.keyDown(backdrop, { key: "Escape" });

      // Both window and backdrop keydown handlers fire
      expect(onClose).toHaveBeenCalled();
    });

    test("other keys do not call onClose", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.keyDown(window, { key: "a" });
      fireEvent.keyDown(window, { key: "Space" });

      expect(onClose).toHaveBeenCalledTimes(0);
    });
  });

  describe("keyboard event cleanup", () => {
    test("removes keyboard listener when modal closes", () => {
      const onClose = mock(() => {});
      const { rerender } = render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      // Close the modal
      rerender(
        <KeyboardShortcutsHelp
          isOpen={false}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      // Escape should no longer trigger onClose
      fireEvent.keyDown(window, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(0);
    });

    test("removes keyboard listener when component unmounts", () => {
      const onClose = mock(() => {});
      const { unmount } = render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      unmount();

      // Escape should no longer trigger onClose
      fireEvent.keyDown(window, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(0);
    });
  });

  describe("unique keys for shortcuts", () => {
    test("handles shortcuts with same key but different modifiers", () => {
      const onClose = mock(() => {});
      const shortcuts: KeyboardShortcut[] = [
        { key: "z", ctrl: true, handler: () => {}, description: "Undo" },
        {
          key: "z",
          ctrl: true,
          shift: true,
          handler: () => {},
          description: "Redo",
        },
      ];

      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={shortcuts}
        />,
      );

      expect(screen.getByText("Undo")).toBeDefined();
      expect(screen.getByText("Redo")).toBeDefined();
    });
  });

  describe("styling", () => {
    test("backdrop has correct classes", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const backdrop = screen.getByRole("dialog");
      expect(backdrop.className).toContain("fixed");
      expect(backdrop.className).toContain("inset-0");
      expect(backdrop.className).toContain("z-50");
    });

    test("kbd elements have styling classes", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const kbdElements = document.querySelectorAll("kbd");
      expect(kbdElements.length).toBeGreaterThan(0);

      for (const kbd of kbdElements) {
        expect(kbd.className).toContain("rounded");
        expect(kbd.className).toContain("font-mono");
        expect(kbd.className).toContain("text-xs");
      }
    });

    test("'Show this help' row has border-t separator", () => {
      const onClose = mock(() => {});
      render(
        <KeyboardShortcutsHelp
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />,
      );

      const helpText = screen.getByText("Show this help");
      const row = helpText.closest("div");
      expect(row?.className).toContain("border-t");
    });
  });
});
