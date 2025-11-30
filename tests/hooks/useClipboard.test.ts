/**
 * Tests for useClipboard hook
 *
 * Tests clipboard copy/paste functionality.
 */

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useClipboard } from "@/hooks/useClipboard";

describe("useClipboard", () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    // Mock clipboard API
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: mock(() => Promise.resolve()),
        readText: mock(() => Promise.resolve("pasted text")),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  describe("initialization", () => {
    test("initializes with default state", () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("copy", () => {
    test("copies text to clipboard", async () => {
      const { result } = renderHook(() => useClipboard());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.copy("test text");
      });

      expect(success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test text");
    });

    test("sets copied to true after successful copy", async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy("test text");
      });

      expect(result.current.copied).toBe(true);
    });

    test("handles copy failure", async () => {
      // Mock failure
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: mock(() => Promise.reject(new Error("Copy denied"))),
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useClipboard());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.copy("test text");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Copy denied");
      expect(result.current.copied).toBe(false);
    });
  });

  describe("paste", () => {
    test("reads text from clipboard", async () => {
      const { result } = renderHook(() => useClipboard());

      let text: string | null | undefined;
      await act(async () => {
        text = await result.current.paste();
      });

      expect(text).toBe("pasted text");
    });

    test("handles paste failure", async () => {
      // Mock failure
      Object.defineProperty(navigator, "clipboard", {
        value: {
          readText: mock(() => Promise.reject(new Error("Paste denied"))),
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useClipboard());

      let text: string | null | undefined;
      await act(async () => {
        text = await result.current.paste();
      });

      expect(text).toBeNull();
      expect(result.current.error).toBe("Paste denied");
    });
  });

  describe("reset", () => {
    test("resets copied and error state", async () => {
      const { result } = renderHook(() => useClipboard());

      // Copy something
      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.copied).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("clipboard not supported", () => {
    test("copy returns false when clipboard API not supported", async () => {
      // Mock missing clipboard API
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: undefined },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useClipboard());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.copy("test text");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Clipboard API not supported");
    });

    test("paste returns null when readText not supported", async () => {
      // Mock missing readText
      Object.defineProperty(navigator, "clipboard", {
        value: { readText: undefined },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useClipboard());

      let text: string | null | undefined;
      await act(async () => {
        text = await result.current.paste();
      });

      expect(text).toBeNull();
      expect(result.current.error).toBe("Clipboard read not supported");
    });

    test("copy handles non-Error thrown value", async () => {
      // Mock throwing non-Error
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: mock(() => Promise.reject("string error")),
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useClipboard());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.copy("test");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Copy failed");
    });

    test("paste handles non-Error thrown value", async () => {
      // Mock throwing non-Error
      Object.defineProperty(navigator, "clipboard", {
        value: {
          readText: mock(() => Promise.reject("string error")),
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useClipboard());

      let text: string | null | undefined;
      await act(async () => {
        text = await result.current.paste();
      });

      expect(text).toBeNull();
      expect(result.current.error).toBe("Paste failed");
    });
  });

  describe("copiedDuration option", () => {
    test("uses custom copiedDuration", async () => {
      const { result } = renderHook(() =>
        useClipboard({ copiedDuration: 100 }),
      );

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.copied).toBe(true);

      // Wait for duration to pass
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(result.current.copied).toBe(false);
    });
  });
});
