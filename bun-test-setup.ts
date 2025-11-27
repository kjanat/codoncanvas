/**
 * Bun test setup file - loaded before all tests
 * Provides minimal DOM environment via happy-dom
 *
 * NOTE: Canvas getContext('2d') returns null in happy-dom by design.
 * Tests that need canvas mocking should mock it locally, not globally.
 */

import { afterEach } from "bun:test";
import { Window } from "happy-dom";

// Initialize happy-dom environment
const window = new Window();
const document = window.document;

// Set up global DOM APIs (minimal - only what happy-dom provides)
globalThis.window = window as unknown as Window & typeof globalThis;
globalThis.document = document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.HTMLCanvasElement = window.HTMLCanvasElement;
globalThis.HTMLAnchorElement = window.HTMLAnchorElement;
globalThis.HTMLTextAreaElement = window.HTMLTextAreaElement;
globalThis.HTMLButtonElement = window.HTMLButtonElement;
globalThis.HTMLSpanElement = window.HTMLSpanElement;
globalThis.HTMLDivElement = window.HTMLDivElement;
globalThis.HTMLSelectElement = window.HTMLSelectElement;
globalThis.HTMLInputElement = window.HTMLInputElement;
globalThis.HTMLImageElement = window.HTMLImageElement;
globalThis.Event = window.Event;
globalThis.CustomEvent = window.CustomEvent;
globalThis.KeyboardEvent = window.KeyboardEvent;
globalThis.MouseEvent = window.MouseEvent;

// File APIs needed for genome-io tests
// Note: Don't override Blob - native Blob is needed for URL.createObjectURL
globalThis.FileReader = window.FileReader;
globalThis.File = window.File;

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

// Override global storage
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

// Clean up storage after each test for isolation
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
