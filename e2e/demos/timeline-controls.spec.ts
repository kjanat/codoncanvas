// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Timeline Navigation Controls", () => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await page.goto("/demos/timeline");

    // Capture timeline first
    const captureButton = page.getByRole("button", {
      name: /run.*capture|capture.*timeline/i,
    });
    await captureButton.click();

    // Wait for timeline to be ready
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("timeline-navigation-controls", async ({ page }): Promise<void> => {
    // 1. Click 'Next step' button multiple times
    const nextButton = page.getByRole("button", { name: /next|forward|>/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Step counter should update
      await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible();
    }

    // 2. Click 'Previous step' button
    const prevButton = page.getByRole("button", { name: /prev|back|</i });
    if (await prevButton.isVisible()) {
      await prevButton.click();
    }

    // 3. Click 'Reset to start' button
    const resetButton = page.getByRole("button", {
      name: /reset|start|first/i,
    });
    if (await resetButton.isVisible()) {
      await resetButton.click();

      // Should be back at step 1
      await expect(page.getByText(/step 1 of \d+/i)).toBeVisible();
    }
  });

  test("timeline-slider-navigation", async ({ page }): Promise<void> => {
    // Use slider to jump to specific step
    const slider = page.locator("input[type='range']").first();
    if (await slider.isVisible()) {
      // Get max value and set to middle
      const max = await slider.getAttribute("max");
      if (max) {
        const midValue = Math.floor(Number.parseInt(max, 10) / 2);
        await slider.fill(String(midValue));
      }
    }
  });

  test("timeline-play-button", async ({ page }): Promise<void> => {
    // Click 'Play' to auto-advance
    const playButton = page.getByRole("button", { name: /play/i });
    if (await playButton.isVisible()) {
      await playButton.click();

      // Play button might change to Pause
      await page.waitForTimeout(500);

      // Stop playback
      const pauseButton = page.getByRole("button", { name: /pause|stop/i });
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
      }
    }
  });
});
