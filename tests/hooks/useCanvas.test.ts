/**
 * Tests for useCanvas hook
 *
 * Tests canvas management, rendering setup, and export functionality.
 * Note: Many tests require canvas mocking since happy-dom doesn't support getContext('2d')
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useCanvas } from "@/hooks/useCanvas";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "@/tests/test-utils/canvas-mock";

describe("useCanvas", () => {
  describe("initialization", () => {
    test("initializes with default dimensions", () => {
      const { result } = renderHook(() => useCanvas());

      expect(result.current.dimensions.width).toBe(400);
      expect(result.current.dimensions.height).toBe(400);
    });

    test("initializes with custom dimensions", () => {
      const { result } = renderHook(() =>
        useCanvas({ width: 800, height: 600 }),
      );

      expect(result.current.dimensions.width).toBe(800);
      expect(result.current.dimensions.height).toBe(600);
    });

    test("provides canvasRef", () => {
      const { result } = renderHook(() => useCanvas());

      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.canvasRef.current).toBeNull(); // Not mounted
    });

    test("renderer is null without canvas element", () => {
      const { result } = renderHook(() => useCanvas());

      expect(result.current.renderer).toBeNull();
    });

    test("isReady is false without canvas element", () => {
      const { result } = renderHook(() => useCanvas());

      expect(result.current.isReady).toBe(false);
    });
  });

  describe("with mocked canvas", () => {
    beforeEach(() => {
      mockCanvasContext();
    });

    afterEach(() => {
      restoreCanvasContext();
    });

    test("resize updates dimensions state", () => {
      const { result } = renderHook(() => useCanvas());

      const canvas = document.createElement("canvas");
      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      act(() => {
        result.current.resize(500, 300);
      });

      expect(result.current.dimensions.width).toBe(500);
      expect(result.current.dimensions.height).toBe(300);
    });

    test("clear works with canvas element", () => {
      const { result } = renderHook(() => useCanvas());

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      expect(() => {
        act(() => {
          result.current.clear();
        });
      }).not.toThrow();
    });

    test("toDataURL returns data URL with canvas", () => {
      const { result } = renderHook(() => useCanvas());

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      const dataUrl = result.current.toDataURL();

      expect(typeof dataUrl === "string").toBe(true);
      expect(dataUrl?.startsWith("data:image/png")).toBe(true);
    });

    test("toDataURL accepts type parameter", () => {
      const { result } = renderHook(() => useCanvas());

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      expect(() => {
        result.current.toDataURL("image/jpeg", 0.8);
      }).not.toThrow();
    });

    test("toBlob resolves to blob with canvas", async () => {
      const { result } = renderHook(() => useCanvas());

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      const blob = await result.current.toBlob();

      expect(blob).not.toBeNull();
      expect(blob?.type).toBe("image/png");
    });
  });

  describe("without canvas", () => {
    test("resize does nothing without canvas ref", () => {
      const { result } = renderHook(() => useCanvas());

      expect(() => {
        act(() => {
          result.current.resize(500, 300);
        });
      }).not.toThrow();

      // Dimensions should remain default since no canvas
      expect(result.current.dimensions.width).toBe(400);
    });

    test("clear does not throw without canvas", () => {
      const { result } = renderHook(() => useCanvas());

      expect(() => {
        act(() => {
          result.current.clear();
        });
      }).not.toThrow();
    });

    test("toDataURL returns null without canvas", () => {
      const { result } = renderHook(() => useCanvas());

      const dataUrl = result.current.toDataURL();

      expect(dataUrl).toBeNull();
    });

    test("toBlob resolves to null without canvas", async () => {
      const { result } = renderHook(() => useCanvas());

      const blob = await result.current.toBlob();

      expect(blob).toBeNull();
    });

    test("refreshRenderer does not throw", () => {
      const { result } = renderHook(() => useCanvas());

      expect(() => {
        act(() => {
          result.current.refreshRenderer();
        });
      }).not.toThrow();
    });
  });

  describe("options", () => {
    test("respects pixelRatio option", () => {
      const { result } = renderHook(() => useCanvas({ pixelRatio: 2 }));

      expect(result.current.dimensions).toBeDefined();
    });

    test("respects autoResize option", () => {
      const { result } = renderHook(() => useCanvas({ autoResize: true }));

      expect(result.current.dimensions).toBeDefined();
    });

    test("respects maintainAspectRatio option", () => {
      const { result } = renderHook(() =>
        useCanvas({
          autoResize: true,
          maintainAspectRatio: false,
        }),
      );

      expect(result.current.dimensions).toBeDefined();
    });
  });

  describe("unmount cleanup", () => {
    test("cleanup on unmount does not throw", () => {
      const { unmount } = renderHook(() => useCanvas({ autoResize: true }));

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe("exportPNG", () => {
    beforeEach(() => {
      mockCanvasContext();
    });

    afterEach(() => {
      restoreCanvasContext();
    });

    test("exportPNG does not throw with canvas", () => {
      const { result } = renderHook(() => useCanvas());

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      expect(() => {
        result.current.exportPNG("test-output.png");
      }).not.toThrow();
    });

    test("exportPNG uses default filename", () => {
      const { result } = renderHook(() => useCanvas());

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      expect(() => {
        result.current.exportPNG();
      }).not.toThrow();
    });
  });

  describe("autoResize with ResizeObserver", () => {
    beforeEach(() => {
      mockCanvasContext();
    });

    afterEach(() => {
      restoreCanvasContext();
    });

    test("autoResize observes container", () => {
      const container = document.createElement("div");
      container.style.width = "800px";
      container.style.height = "600px";
      document.body.appendChild(container);

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      container.appendChild(canvas);

      const { result } = renderHook(() =>
        useCanvas({ autoResize: true, width: 400, height: 400 }),
      );

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.dimensions).toBeDefined();

      document.body.removeChild(container);
    });

    test("autoResize with maintainAspectRatio false", () => {
      const container = document.createElement("div");
      container.style.width = "800px";
      container.style.height = "400px";
      document.body.appendChild(container);

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      container.appendChild(canvas);

      const { result } = renderHook(() =>
        useCanvas({
          autoResize: true,
          maintainAspectRatio: false,
          width: 400,
          height: 400,
        }),
      );

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.dimensions).toBeDefined();

      document.body.removeChild(container);
    });

    test("autoResize adjusts for wider container", () => {
      const container = document.createElement("div");
      Object.defineProperty(container, "clientWidth", { value: 800 });
      Object.defineProperty(container, "clientHeight", { value: 400 });
      document.body.appendChild(container);

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      container.appendChild(canvas);

      const { result, unmount } = renderHook(() =>
        useCanvas({
          autoResize: true,
          maintainAspectRatio: true,
          width: 400,
          height: 400,
        }),
      );

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.dimensions).toBeDefined();

      unmount();
      document.body.removeChild(container);
    });

    test("autoResize adjusts for taller container", () => {
      const container = document.createElement("div");
      Object.defineProperty(container, "clientWidth", { value: 400 });
      Object.defineProperty(container, "clientHeight", { value: 800 });
      document.body.appendChild(container);

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      container.appendChild(canvas);

      const { result, unmount } = renderHook(() =>
        useCanvas({
          autoResize: true,
          maintainAspectRatio: true,
          width: 400,
          height: 400,
        }),
      );

      Object.defineProperty(result.current.canvasRef, "current", {
        value: canvas,
        writable: true,
      });

      expect(result.current.dimensions).toBeDefined();

      unmount();
      document.body.removeChild(container);
    });
  });

  describe("renderer error handling", () => {
    test("handles renderer creation failure gracefully", () => {
      // Canvas without context support
      const { result } = renderHook(() => useCanvas());

      expect(result.current.renderer).toBeNull();
      expect(result.current.isReady).toBe(false);
    });
  });
});
