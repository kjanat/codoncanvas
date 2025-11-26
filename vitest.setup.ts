import { afterEach, beforeAll, vi } from "vitest";

// jsdom setup runs automatically via environment: "jsdom" in vite.config.ts
// This setup file adds global test utilities and cleanup

beforeAll(() => {
  // Ensure DOM APIs are available
  if (typeof document === "undefined") {
    throw new Error("jsdom environment not initialized properly");
  }

  // Ensure localStorage is properly initialized with all methods
  // jsdom provides localStorage but it may not work properly in all contexts
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value?.toString() || "";
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => {
        const keys = Object.keys(store);
        return keys[index] || null;
      },
    };
  })();

  // Override global.localStorage to ensure it works in tests
  Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });

  // Mock canvas methods that jsdom doesn't fully implement
  HTMLCanvasElement.prototype.getContext = ((
    contextId: string,
  ): RenderingContext | null => {
    if (contextId === "2d") {
      // Track canvas state for rendering validation
      let hasDrawn = false;

      return {
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        font: "",
        textAlign: "start",
        textBaseline: "alphabetic",
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        shadowBlur: 0,
        shadowColor: "transparent",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        lineCap: "butt",
        lineJoin: "miter",
        miterLimit: 10,
        lineDashOffset: 0,
        fillRect: () => {
          hasDrawn = true;
        },
        strokeRect: () => {
          hasDrawn = true;
        },
        clearRect: () => {},
        fillText: () => {
          hasDrawn = true;
        },
        strokeText: () => {
          hasDrawn = true;
        },
        measureText: (text: string) => ({ width: text.length * 10 }),
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {
          hasDrawn = true;
        },
        arcTo: () => {
          hasDrawn = true;
        },
        ellipse: () => {
          hasDrawn = true;
        },
        rect: () => {
          hasDrawn = true;
        },
        quadraticCurveTo: () => {},
        bezierCurveTo: () => {},
        stroke: () => {
          hasDrawn = true;
        },
        fill: () => {
          hasDrawn = true;
        },
        clip: () => {},
        isPointInPath: () => false,
        isPointInStroke: () => false,
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        transform: () => {},
        setTransform: () => {},
        resetTransform: () => {},
        drawImage: () => {
          hasDrawn = true;
        },
        createLinearGradient: () => ({
          addColorStop: () => {},
        }),
        createRadialGradient: () => ({
          addColorStop: () => {},
        }),
        createPattern: () => null,
        setLineDash: () => {},
        getLineDash: () => [],
        getImageData: (_sx: number, _sy: number, sw: number, sh: number) => {
          const size = sw * sh * 4;
          // Return non-empty data to simulate actual rendering
          const data = new Uint8ClampedArray(size);
          if (hasDrawn) {
            // Fill with non-transparent data to indicate rendering occurred
            for (let i = 0; i < size; i += 4) {
              data[i] = 128; // R
              data[i + 1] = 128; // G
              data[i + 2] = 128; // B
              data[i + 3] = 255; // A (opaque)
            }
          }
          return {
            data,
            width: sw,
            height: sh,
          };
        },
        putImageData: () => {},
        createImageData: (width: number, height: number) => ({
          data: new Uint8ClampedArray(width * height * 4),
          width,
          height,
        }),
      };
    }
    return null;
  }) as typeof HTMLCanvasElement.prototype.getContext;

  // Mock toDataURL for canvas
  HTMLCanvasElement.prototype.toDataURL = () =>
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  // Mock toBlob for canvas
  HTMLCanvasElement.prototype.toBlob = (callback: BlobCallback) => {
    setTimeout(() => {
      callback(new Blob([""], { type: "image/png" }));
    }, 0);
  };
});

// Clean up after each test
afterEach(() => {
  // Clear localStorage between tests
  localStorage.clear();
  // Clear any timers
  vi.clearAllTimers();
});
