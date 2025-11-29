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

// Register global registrator
GlobalRegistrator.register();

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
    // Add missing properties required by Storage interface
    [Symbol.iterator]: function* () {
      for (const key of Object.keys(store)) {
        yield key;
      }
    },
  } as unknown as Storage;
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
