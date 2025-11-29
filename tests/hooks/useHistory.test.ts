/**
 * Tests for useHistory hook
 *
 * Tests undo/redo functionality and history management.
 */

import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useHistory } from "@/hooks/useHistory";

describe("useHistory", () => {
  describe("initialization", () => {
    test("initializes with initial state", () => {
      const { result } = renderHook(() => useHistory("initial"));

      expect(result.current.state).toBe("initial");
    });

    test("starts with empty history", () => {
      const { result } = renderHook(() => useHistory("initial"));

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
      expect(result.current.undoCount).toBe(0);
      expect(result.current.redoCount).toBe(0);
    });
  });

  describe("setState", () => {
    test("updates state value", () => {
      const { result } = renderHook(() => useHistory("initial"));

      act(() => {
        result.current.setState("updated");
      });

      expect(result.current.state).toBe("updated");
    });

    test("accepts function updater", () => {
      const { result } = renderHook(() => useHistory(0));

      act(() => {
        result.current.setState((prev) => prev + 1);
      });

      expect(result.current.state).toBe(1);
    });

    test("adds to undo history", () => {
      const { result } = renderHook(() => useHistory("initial"));

      act(() => {
        result.current.setState("updated");
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.undoCount).toBe(1);
    });

    test("clears redo history on new change", () => {
      const { result } = renderHook(() => useHistory("initial"));

      // Make changes
      act(() => {
        result.current.setState("change1");
        result.current.setState("change2");
      });

      // Undo
      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      // Make new change
      act(() => {
        result.current.setState("new-change");
      });

      expect(result.current.canRedo).toBe(false);
      expect(result.current.redoCount).toBe(0);
    });

    test("does not add to history if value unchanged", () => {
      const { result } = renderHook(() => useHistory("same"));

      act(() => {
        result.current.setState("same");
      });

      expect(result.current.undoCount).toBe(0);
    });
  });

  describe("undo", () => {
    test("restores previous state", () => {
      const { result } = renderHook(() => useHistory("initial"));

      act(() => {
        result.current.setState("updated");
      });

      expect(result.current.state).toBe("updated");

      act(() => {
        result.current.undo();
      });

      expect(result.current.state).toBe("initial");
    });

    test("adds current state to redo history", () => {
      const { result } = renderHook(() => useHistory("initial"));

      act(() => {
        result.current.setState("updated");
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);
      expect(result.current.redoCount).toBe(1);
    });

    test("does nothing when no history", () => {
      const { result } = renderHook(() => useHistory("initial"));

      act(() => {
        result.current.undo();
      });

      expect(result.current.state).toBe("initial");
    });

    test("multiple undos work correctly", () => {
      const { result } = renderHook(() => useHistory("a"));

      act(() => {
        result.current.setState("b");
        result.current.setState("c");
        result.current.setState("d");
      });

      expect(result.current.state).toBe("d");

      act(() => {
        result.current.undo();
      });
      expect(result.current.state).toBe("c");

      act(() => {
        result.current.undo();
      });
      expect(result.current.state).toBe("b");

      act(() => {
        result.current.undo();
      });
      expect(result.current.state).toBe("a");
    });
  });

  describe("redo", () => {
    test("restores undone state", () => {
      const { result } = renderHook(() => useHistory("initial"));

      act(() => {
        result.current.setState("updated");
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.state).toBe("initial");

      act(() => {
        result.current.redo();
      });

      expect(result.current.state).toBe("updated");
    });

    test("does nothing when no future states", () => {
      const { result } = renderHook(() => useHistory("initial"));

      act(() => {
        result.current.redo();
      });

      expect(result.current.state).toBe("initial");
    });

    test("multiple redos work correctly", () => {
      const { result } = renderHook(() => useHistory("a"));

      act(() => {
        result.current.setState("b");
        result.current.setState("c");
      });

      act(() => {
        result.current.undo();
        result.current.undo();
      });

      expect(result.current.state).toBe("a");

      act(() => {
        result.current.redo();
      });
      expect(result.current.state).toBe("b");

      act(() => {
        result.current.redo();
      });
      expect(result.current.state).toBe("c");
    });
  });

  describe("clearHistory", () => {
    test("clears all history", () => {
      const { result } = renderHook(() => useHistory("initial"));

      act(() => {
        result.current.setState("change1");
        result.current.setState("change2");
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(true);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
      expect(result.current.state).toBe("change1"); // Keeps current state
    });
  });

  describe("maxHistory option", () => {
    test("limits history size", () => {
      const { result } = renderHook(() => useHistory("0", { maxHistory: 3 }));

      act(() => {
        result.current.setState("1");
        result.current.setState("2");
        result.current.setState("3");
        result.current.setState("4");
        result.current.setState("5");
      });

      // Should only have 3 undo steps
      expect(result.current.undoCount).toBe(3);

      // Undo should go back to "2", not "0"
      act(() => {
        result.current.undo();
        result.current.undo();
        result.current.undo();
      });

      expect(result.current.state).toBe("2");
      expect(result.current.canUndo).toBe(false);
    });
  });

  describe("with objects", () => {
    test("works with object state", () => {
      const { result } = renderHook(() =>
        useHistory({ name: "Alice", age: 30 }),
      );

      act(() => {
        result.current.setState({ name: "Bob", age: 25 });
      });

      expect(result.current.state).toEqual({ name: "Bob", age: 25 });

      act(() => {
        result.current.undo();
      });

      expect(result.current.state).toEqual({ name: "Alice", age: 30 });
    });
  });
});
