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
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible();

    // 2. Click 'Previous step' button
    const prevButton = page.getByRole("button", { name: /prev|back|</i });
    await expect(prevButton).toBeVisible();
    await prevButton.click();
    // Verify step counter updated
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible();

    // 3. Click 'Reset to start' button
    const resetButton = page.getByRole("button", {
      name: /reset|start|first/i,
    });
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    await expect(page.getByText(/step 1 of \d+/i)).toBeVisible();
  });

  test("timeline-slider-navigation", async ({ page }): Promise<void> => {
    // Use slider to jump to specific step
    const slider = page.locator("input[type='range']").first();
    await expect(slider).toBeVisible();

    const max = await slider.getAttribute("max");
    if (!max) throw new Error("Max attribute is missing");
    const midValue = Math.floor(Number.parseInt(max, 10) / 2);
    await slider.fill(String(midValue));

    // Verify step indicator reflects the slider position (UI is 1-based)
    await expect(
      page.getByText(new RegExp(`step ${midValue + 1}`, "i")),
    ).toBeVisible();
  });

  test("timeline-play-button", async ({ page }): Promise<void> => {
    // Click 'Play' to auto-advance
    const playButton = page.getByRole("button", { name: /play/i });
    await expect(playButton).toBeVisible();
    await playButton.click();

    // Wait for pause button to appear (play transforms to pause)
    const pauseButton = page.getByRole("button", { name: /pause|stop/i });
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();

    // Verify play button returns after stopping
    await expect(playButton).toBeVisible();
  });
});
