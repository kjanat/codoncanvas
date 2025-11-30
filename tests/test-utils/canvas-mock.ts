/**
 * Canvas mock utilities for tests that need 2D context
 *
 * Usage:
 *   import { mockCanvasContext, restoreCanvasContext } from './test-utils/canvas-mock';
 *
 *   beforeEach(() => mockCanvasContext());
 *   afterEach(() => restoreCanvasContext());
 */

type CanvasGetContext = typeof HTMLCanvasElement.prototype.getContext;
type CanvasToDataURL = typeof HTMLCanvasElement.prototype.toDataURL;
type CanvasToBlob = typeof HTMLCanvasElement.prototype.toBlob;

let originalGetContext: CanvasGetContext | null = null;
let originalToDataURL: CanvasToDataURL | null = null;
let originalToBlob: CanvasToBlob | null = null;

/**
 * Creates a minimal 2D context mock that tracks draw operations
 */
export function createContext2DMock() {
  return {
    // Style properties
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "start" as CanvasTextAlign,
    textBaseline: "alphabetic" as CanvasTextBaseline,
    globalAlpha: 1,

    // Drawing methods (no-ops)
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    fillText: () => {},
    strokeText: () => {},
    measureText: (text: string) => ({ width: text.length * 10 }),

    // Path methods
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    arcTo: () => {},
    ellipse: () => {},
    rect: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    stroke: () => {},
    fill: () => {},
    clip: () => {},

    // Transform methods
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    transform: () => {},
    setTransform: () => {},
    resetTransform: () => {},

    // Image methods
    drawImage: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createPattern: () => null,

    // Pixel methods
    getImageData: (_sx: number, _sy: number, sw: number, sh: number) => ({
      data: new Uint8ClampedArray(sw * sh * 4),
      width: sw,
      height: sh,
    }),
    putImageData: () => {},
    createImageData: (width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
    }),

    // Line style
    setLineDash: () => {},
    getLineDash: () => [] as number[],

    // Hit testing
    isPointInPath: () => false,
    isPointInStroke: () => false,
  } as unknown as CanvasRenderingContext2D;
}

// 1x1 transparent PNG as base64
const MOCK_PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * Mock HTMLCanvasElement.prototype.getContext to return a 2D context
 * Also mocks toDataURL and toBlob for complete canvas support
 * Call this in beforeEach for tests that need canvas
 */
export function mockCanvasContext(): void {
  if (originalGetContext !== null) {
    return; // Already mocked
  }

  originalGetContext = HTMLCanvasElement.prototype.getContext;
  originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  originalToBlob = HTMLCanvasElement.prototype.toBlob;

  HTMLCanvasElement.prototype.getContext = ((contextId: string) => {
    if (contextId === "2d") {
      return createContext2DMock();
    }
    return null;
  }) as CanvasGetContext;

  HTMLCanvasElement.prototype.toDataURL = () => MOCK_PNG_DATA_URL;

  HTMLCanvasElement.prototype.toBlob = (callback: BlobCallback) => {
    setTimeout(() => {
      callback(new Blob(["mock-image-data"], { type: "image/png" }));
    }, 0);
  };
}

/**
 * Restore original canvas behavior
 * Call this in afterEach
 */
export function restoreCanvasContext(): void {
  if (originalGetContext !== null) {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    originalGetContext = null;
  }
  if (originalToDataURL !== null) {
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
    originalToDataURL = null;
  }
  if (originalToBlob !== null) {
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
    originalToBlob = null;
  }
}

/**
 * Create a mock Renderer for use in hook/component tests
 * Matches the Renderer interface from src/core/renderer.ts
 */
export function createMockRenderer() {
  return {
    // Properties
    width: 400,
    height: 400,

    // Lifecycle methods
    resize: () => {},
    clear: () => {},

    // Drawing methods
    circle: (_radius: number) => {},
    rect: (_width: number, _height: number) => {},
    line: (_length: number) => {},
    triangle: (_size: number) => {},
    ellipse: (_rx: number, _ry: number) => {},
    noise: (_seed: number, _intensity: number) => {},

    // Transform methods
    translate: (_dx: number, _dy: number) => {},
    setPosition: (_x: number, _y: number) => {},
    rotate: (_degrees: number) => {},
    setRotation: (_degrees: number) => {},
    scale: (_factor: number) => {},
    setScale: (_scale: number) => {},

    // Color
    setColor: (_h: number, _s: number, _l: number) => {},

    // State
    getCurrentTransform: () => ({
      x: 200,
      y: 200,
      rotation: 0,
      scale: 1,
    }),

    // Export
    toDataURL: () => "data:image/png;base64,mock",
  };
}
