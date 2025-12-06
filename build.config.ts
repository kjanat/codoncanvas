/**
 * Shared Build Configuration
 *
 * Provides consistent configuration for build tools (Vite, Playwright).
 *
 * @remarks
 * This file is for **build-time tooling only** (Node.js environment).
 * Client-side code (React) should use `import.meta.env.VITE_*` instead,
 * which Vite populates from the same environment variables.
 *
 * @example
 * ```ts
 * // In vite.config.ts or playwright.config.ts
 * import { buildConfig, getBaseUrl } from "./build.config";
 *
 * // In React components (client-side)
 * const basePath = import.meta.env.VITE_BASE_PATH ?? "";
 * ```
 *
 * @see {@link https://vite.dev/guide/env-and-mode.html} for Vite env handling
 */

/** Normalized base path without trailing slash (empty string for root) */
const basePath = (process.env.VITE_BASE_PATH ?? "").replace(/\/+$/, "");

/** Whether running in CI environment (GitHub Actions or GitHub Pages deploy) */
const isCI = !!process.env.CI || process.env.GITHUB_PAGES === "true";

export const buildConfig = {
  /** True when running in CI (GitHub Actions, GitHub Pages deploy) */
  isCI,
  /**
   * Base path with trailing slash for Vite's `base` option.
   * @example "/" or "/codoncanvas/"
   */
  base: `${basePath}/`,
  /** Dev server configuration */
  server: {
    /** Server host (default: 127.0.0.1) */
    host: "127.0.0.1",
    /** Server port (default: 5173) */
    port: 5173,
  },
} as const;

/**
 * Get the full base URL for the dev server.
 * @returns Full URL including protocol, host, port, and base path
 * @example "http://127.0.0.1:5173" or "http://127.0.0.1:5173/codoncanvas"
 */
export const getBaseUrl = (): string =>
  `http://${buildConfig.server.host}:${buildConfig.server.port}${basePath}`;
