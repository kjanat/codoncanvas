/**
 * useCanvas - React hook for canvas management
 *
 * Handles canvas ref, renderer initialization, resize handling,
 * and provides convenient methods for canvas operations.
 */

import { useEffect, useRef, useState } from "react";
import { Canvas2DRenderer, type Renderer } from "@/core/renderer";
import {
  canvasToBlob,
  canvasToDataURL,
  clearCanvas,
  downloadCanvasPNG,
} from "@/utils/canvas-export";

/** Canvas dimensions */
export interface CanvasDimensions {
  width: number;
  height: number;
}

/** Options for useCanvas hook */
export interface UseCanvasOptions {
  /** Initial canvas width (default: 400) */
  width?: number;
  /** Initial canvas height (default: 400) */
  height?: number;
  /** Auto-resize to container (default: false) */
  autoResize?: boolean;
  /** Maintain aspect ratio when resizing (default: true) */
  maintainAspectRatio?: boolean;
  /** Device pixel ratio for high-DPI displays (default: window.devicePixelRatio) */
  pixelRatio?: number;
}

/** Return type of useCanvas hook */
export interface UseCanvasReturn {
  /** Ref to attach to canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Current renderer instance (null until canvas mounted) */
  renderer: Renderer | null;
  /** Current canvas dimensions */
  dimensions: CanvasDimensions;
  /** Whether canvas is ready for rendering */
  isReady: boolean;
  /** Clear the canvas */
  clear: () => void;
  /** Resize canvas to new dimensions */
  resize: (width: number, height: number) => void;
  /** Get canvas as data URL (for export) */
  toDataURL: (type?: string, quality?: number) => string | null;
  /** Get canvas as Blob (for download) */
  toBlob: (type?: string, quality?: number) => Promise<Blob | null>;
  /** Export canvas as PNG file download */
  exportPNG: (filename?: string) => void;
  /** Force renderer refresh */
  refreshRenderer: () => void;
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 400;

/**
 * React hook for canvas management and rendering.
 *
 * @example
 * ```tsx
 * function CanvasComponent() {
 *   const { canvasRef, renderer, isReady, clear } = useCanvas({
 *     width: 600,
 *     height: 400,
 *   });
 *
 *   useEffect(() => {
 *     if (isReady && renderer) {
 *       const vm = new CodonVM(renderer);
 *       vm.run(tokens);
 *     }
 *   }, [isReady, renderer, tokens]);
 *
 *   return (
 *     <div>
 *       <canvas ref={canvasRef} />
 *       <button onClick={clear}>Clear</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCanvas(options: UseCanvasOptions = {}): UseCanvasReturn {
  const {
    width: initialWidth = DEFAULT_WIDTH,
    height: initialHeight = DEFAULT_HEIGHT,
    autoResize = false,
    maintainAspectRatio = true,
    pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1,
  } = options;

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // State
  const [renderer, setRenderer] = useState<Renderer | null>(null);
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: initialWidth,
    height: initialHeight,
  });
  const [isReady, setIsReady] = useState(false);

  // Store pixelRatio in ref to avoid stale closures
  const pixelRatioRef = useRef(pixelRatio);
  pixelRatioRef.current = pixelRatio;

  // Initialize renderer - stored in ref for stable reference
  const initRendererRef = useRef(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setRenderer(null);
      setIsReady(false);
      return;
    }

    try {
      const newRenderer = new Canvas2DRenderer(canvas);
      setRenderer(newRenderer);
      setIsReady(true);
    } catch (err) {
      console.error("Failed to create renderer:", err);
      setRenderer(null);
      setIsReady(false);
    }
  });

  // Refresh renderer (e.g., after resize)
  const refreshRenderer = () => {
    initRendererRef.current();
  };

  // Clear canvas - delegate to utility
  const clear = () => {
    clearCanvas(canvasRef.current);
  };

  // Resize canvas - stored in ref for stable reference in ResizeObserver
  const resizeRef = useRef((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = pixelRatioRef.current;

    // Apply pixel ratio for high-DPI displays
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context for pixel ratio
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
    }

    setDimensions({ width, height });

    // Refresh renderer after resize
    initRendererRef.current();
  });

  // Public resize function
  const resize = (width: number, height: number) => {
    resizeRef.current(width, height);
  };

  // Export utilities - delegate to pure functions
  const toDataURL = (type?: string, quality?: number) =>
    canvasToDataURL(canvasRef.current, type, quality);

  const toBlob = (type?: string, quality?: number) =>
    canvasToBlob(canvasRef.current, type, quality);

  const exportPNG = (filename?: string) =>
    downloadCanvasPNG(canvasRef.current, filename ?? "codoncanvas-output.png");

  // Initialize renderer on mount and when ref changes
  useEffect(() => {
    const initRenderer = initRendererRef.current;

    // Check immediately
    if (canvasRef.current) {
      initRenderer();
    }

    // Also check on next frame (for cases where ref is set after render)
    const frameId = requestAnimationFrame(() => {
      if (canvasRef.current) {
        initRenderer();
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Auto-resize handling
  useEffect(() => {
    if (!autoResize) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const resizeFn = resizeRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerWidth, height: containerHeight } =
          entry.contentRect;

        let newWidth = containerWidth;
        let newHeight = containerHeight;

        if (maintainAspectRatio) {
          const aspectRatio = initialWidth / initialHeight;
          const containerRatio = containerWidth / containerHeight;

          if (containerRatio > aspectRatio) {
            newWidth = containerHeight * aspectRatio;
          } else {
            newHeight = containerWidth / aspectRatio;
          }
        }

        resizeFn(newWidth, newHeight);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [autoResize, maintainAspectRatio, initialWidth, initialHeight]);

  return {
    canvasRef,
    renderer,
    dimensions,
    isReady,
    clear,
    resize,
    toDataURL,
    toBlob,
    exportPNG,
    refreshRenderer,
  };
}

export default useCanvas;
