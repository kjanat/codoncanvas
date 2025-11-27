/// <reference lib="dom" />
/**
 * Bun test setup file - loaded before all tests
 * Provides minimal DOM environment via happy-dom
 *
 * NOTE: Canvas getContext('2d') returns null in happy-dom by design.
 * Tests that need canvas mocking should mock it locally, not globally.
 */

import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { Window as HappyWindow } from "happy-dom";

// Register global registrator
GlobalRegistrator.register();

// Initialize happy-dom environment
const window = new HappyWindow();
const document = window.document;

// Set up global DOM APIs (minimal - only what happy-dom provides)
globalThis.window = window as unknown as Window & typeof globalThis;
globalThis.document = document as unknown as Document;
globalThis.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
globalThis.HTMLCanvasElement =
  window.HTMLCanvasElement as unknown as typeof HTMLCanvasElement;
globalThis.HTMLAnchorElement =
  window.HTMLAnchorElement as unknown as typeof HTMLAnchorElement;
globalThis.HTMLTextAreaElement =
  window.HTMLTextAreaElement as unknown as typeof HTMLTextAreaElement;
globalThis.HTMLButtonElement =
  window.HTMLButtonElement as unknown as typeof HTMLButtonElement;
globalThis.HTMLSpanElement =
  window.HTMLSpanElement as unknown as typeof HTMLSpanElement;
globalThis.HTMLDivElement =
  window.HTMLDivElement as unknown as typeof HTMLDivElement;
globalThis.HTMLSelectElement =
  window.HTMLSelectElement as unknown as typeof HTMLSelectElement;
globalThis.HTMLInputElement =
  window.HTMLInputElement as unknown as typeof HTMLInputElement;
globalThis.HTMLImageElement =
  window.HTMLImageElement as unknown as typeof HTMLImageElement;
globalThis.HTMLFormElement =
  window.HTMLFormElement as unknown as typeof HTMLFormElement;
globalThis.HTMLLIElement =
  window.HTMLLIElement as unknown as typeof HTMLLIElement;
globalThis.HTMLUListElement =
  window.HTMLUListElement as unknown as typeof HTMLUListElement;
globalThis.HTMLParagraphElement =
  window.HTMLParagraphElement as unknown as typeof HTMLParagraphElement;
globalThis.Event = window.Event as unknown as typeof Event;
globalThis.CustomEvent = window.CustomEvent as unknown as typeof CustomEvent;
globalThis.KeyboardEvent =
  window.KeyboardEvent as unknown as typeof KeyboardEvent;
globalThis.MouseEvent = window.MouseEvent as unknown as typeof MouseEvent;

// File APIs needed for genome-io tests
// Note: Don't override Blob - native Blob is needed for URL.createObjectURL
globalThis.FileReader = window.FileReader as unknown as typeof FileReader;
globalThis.File = window.File as unknown as typeof File;

// Storage factory - creates isolated storage instances
function createStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
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
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

// Create storage instances
const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

// Override global storage on both globalThis and window for consistency
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
  configurable: true,
});

// Also sync window.localStorage/sessionStorage for code that accesses via window
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
  configurable: true,
});

// Clean up storage after each test for isolation
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
