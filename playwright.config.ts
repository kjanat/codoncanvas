import { defineConfig, devices } from "@playwright/test";
import { buildConfig, getBaseUrl } from "./build.config";

/**
 * CodonCanvas Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: buildConfig.isCI,
  /* Retry on CI only */
  retries: buildConfig.isCI ? 1 : 0,
  /* Use 4 parallel workers in CI for better performance */
  workers: buildConfig.isCI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["list"]],
  /* Global timeout for each test */
  timeout: 30000,
  /* Expect timeout */
  expect: {
    timeout: 5000,
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: getBaseUrl(),
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: buildConfig.isCI
    ? [
        /* Desktop browsers */
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        { name: "webkit", use: { ...devices["Desktop Safari"] } },
        /* Mobile viewports */
        { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
        { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
        /* Tablet viewport */
        { name: "Tablet", use: { ...devices["iPad (gen 7)"] } },
      ]
    : [
        /* Local dev: Chromium only for speed */
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
      ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "bun run dev",
    url: getBaseUrl(),
    reuseExistingServer: !buildConfig.isCI,
    timeout: 120000,
  },
});
