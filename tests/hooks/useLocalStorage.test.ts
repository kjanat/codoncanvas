/**
 * Tests for useLocalStorage hook
 *
 * Tests localStorage-backed state persistence.
 */

import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    test("returns initial value when key not in storage", () => {
      const { result } = renderHook(() =>
        useLocalStorage("test-key", "initial"),
      );

      expect(result.current[0]).toBe("initial");
    });

    test("returns stored value when key exists", () => {
      localStorage.setItem("existing-key", JSON.stringify("stored-value"));

      const { result } = renderHook(() =>
        useLocalStorage("existing-key", "initial"),
      );

      expect(result.current[0]).toBe("stored-value");
    });

    test("handles invalid JSON gracefully", () => {
      const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
      localStorage.setItem("bad-json", "not valid json {{{");

      const { result } = renderHook(() =>
        useLocalStorage("bad-json", "fallback"),
      );

      expect(result.current[0]).toBe("fallback");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error reading localStorage key"),
        expect.any(SyntaxError),
      );
      warnSpy.mockRestore();
    });
  });

  describe("setValue", () => {
    test("updates state value", () => {
      const { result } = renderHook(() =>
        useLocalStorage("test-key", "initial"),
      );

      act(() => {
        result.current[1]("updated");
      });

      expect(result.current[0]).toBe("updated");
    });

    test("persists to localStorage", () => {
      const { result } = renderHook(() =>
        useLocalStorage("persist-key", "initial"),
      );

      act(() => {
        result.current[1]("persisted");
      });

      expect(localStorage.getItem("persist-key")).toBe(
        JSON.stringify("persisted"),
      );
    });

    test("accepts function updater", () => {
      const { result } = renderHook(() => useLocalStorage("counter", 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);
    });
  });

  describe("with different types", () => {
    test("handles numbers", () => {
      const { result } = renderHook(() => useLocalStorage("number-key", 42));

      expect(result.current[0]).toBe(42);

      act(() => {
        result.current[1](100);
      });

      expect(result.current[0]).toBe(100);
    });

    test("handles booleans", () => {
      const { result } = renderHook(() => useLocalStorage("bool-key", true));

      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1](false);
      });

      expect(result.current[0]).toBe(false);
    });

    test("handles objects", () => {
      const initial = { name: "test", count: 0 };
      const { result } = renderHook(() =>
        useLocalStorage("object-key", initial),
      );

      expect(result.current[0]).toEqual(initial);

      act(() => {
        result.current[1]({ name: "updated", count: 5 });
      });

      expect(result.current[0]).toEqual({ name: "updated", count: 5 });
    });

    test("handles arrays", () => {
      const { result } = renderHook(() =>
        useLocalStorage("array-key", [1, 2, 3]),
      );

      expect(result.current[0]).toEqual([1, 2, 3]);

      act(() => {
        result.current[1]([4, 5, 6]);
      });

      expect(result.current[0]).toEqual([4, 5, 6]);
    });

    test("handles null", () => {
      const { result } = renderHook(() =>
        useLocalStorage<string | null>("nullable-key", null),
      );

      expect(result.current[0]).toBeNull();

      act(() => {
        result.current[1]("not null");
      });

      expect(result.current[0]).toBe("not null");
    });
  });

  describe("multiple instances", () => {
    test("different keys are independent", () => {
      const { result: result1 } = renderHook(() =>
        useLocalStorage("key1", "value1"),
      );
      const { result: result2 } = renderHook(() =>
        useLocalStorage("key2", "value2"),
      );

      expect(result1.current[0]).toBe("value1");
      expect(result2.current[0]).toBe("value2");

      act(() => {
        result1.current[1]("updated1");
      });

      expect(result1.current[0]).toBe("updated1");
      expect(result2.current[0]).toBe("value2");
    });
  });
});
