/**
 * Tests for ToastContext
 */

import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { ToastProvider, useToast } from "@/contexts";

// Wrapper for hook tests
function wrapper({ children }: { children: ReactNode }) {
  return createElement(ToastProvider, null, children);
}

describe("ToastContext", () => {
  describe("useToast", () => {
    test("throws error when used outside ToastProvider", () => {
      expect(() => {
        renderHook(() => useToast());
      }).toThrow("useToast must be used within a ToastProvider");
    });

    test("returns empty toasts array initially", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      expect(result.current.toasts).toEqual([]);
    });

    test("addToast adds a toast with default variant", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.toast({ message: "Test message" });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe("Test message");
      expect(result.current.toasts[0].variant).toBe("info");
    });

    test("addToast adds a toast with specified variant", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.toast({ message: "Error!", variant: "error" });
      });

      expect(result.current.toasts[0].variant).toBe("error");
    });

    test("addToast includes title when provided", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.toast({ message: "Body", title: "Title" });
      });

      expect(result.current.toasts[0].title).toBe("Title");
    });

    test("addToast returns unique toast ID", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let id1: string;
      let id2: string;

      act(() => {
        id1 = result.current.toast({ message: "First" });
        id2 = result.current.toast({ message: "Second" });
      });

      expect(id1!).toBeDefined();
      expect(id2!).toBeDefined();
      expect(id1!).not.toBe(id2!);
    });

    test("success convenience method adds success toast", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.success("Success!");
      });

      expect(result.current.toasts[0].variant).toBe("success");
      expect(result.current.toasts[0].message).toBe("Success!");
    });

    test("error convenience method adds error toast", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.error("Error!");
      });

      expect(result.current.toasts[0].variant).toBe("error");
    });

    test("warning convenience method adds warning toast", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.warning("Warning!");
      });

      expect(result.current.toasts[0].variant).toBe("warning");
    });

    test("info convenience method adds info toast", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.info("Info!");
      });

      expect(result.current.toasts[0].variant).toBe("info");
    });

    test("convenience methods accept optional title", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.success("Message", "Title");
      });

      expect(result.current.toasts[0].title).toBe("Title");
    });

    test("dismiss removes specific toast by ID", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let toastId: string;

      act(() => {
        toastId = result.current.toast({ message: "To remove" });
        result.current.toast({ message: "To keep" });
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        result.current.dismiss(toastId!);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe("To keep");
    });

    test("clearAll removes all toasts", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.toast({ message: "First" });
        result.current.toast({ message: "Second" });
        result.current.toast({ message: "Third" });
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    test("toast includes createdAt timestamp", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      const before = Date.now();

      act(() => {
        result.current.toast({ message: "Test" });
      });

      const after = Date.now();

      expect(result.current.toasts[0].createdAt).toBeGreaterThanOrEqual(before);
      expect(result.current.toasts[0].createdAt).toBeLessThanOrEqual(after);
    });

    test("toast uses default duration based on variant", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.success("Success");
        result.current.error("Error");
        result.current.warning("Warning");
        result.current.info("Info");
      });

      // Success: 4000ms, Error: 6000ms, Warning: 5000ms, Info: 4000ms
      expect(result.current.toasts[0].duration).toBe(4000); // success
      expect(result.current.toasts[1].duration).toBe(6000); // error
      expect(result.current.toasts[2].duration).toBe(5000); // warning
      expect(result.current.toasts[3].duration).toBe(4000); // info
    });

    test("toast uses custom duration when provided", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.toast({ message: "Custom", duration: 10000 });
      });

      expect(result.current.toasts[0].duration).toBe(10000);
    });
  });
});
