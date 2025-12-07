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
    // Helper to parse current step from "Step X of Y" text
    async function getCurrentStep(): Promise<number> {
      const stepText = await page.getByText(/step \d+ of \d+/i).textContent();
      if (!stepText) throw new Error("Step indicator not found");
      const match = stepText.match(/step (\d+) of (\d+)/i);
      if (!match) throw new Error(`Failed to parse step text: "${stepText}"`);
      return parseInt(match[1], 10);
    }

    const nextButton = page.getByRole("button", { name: /next|forward|>/i });
    const prevButton = page.getByRole("button", { name: /prev|back|</i });
    const resetButton = page.getByRole("button", {
      name: /reset|start|first/i,
    });

    // Capture initial step
    const initialStep = await getCurrentStep();

    // Click Next - step should increment by 1
    await nextButton.click();
    const afterNext = await getCurrentStep();
    expect(afterNext).toBe(initialStep + 1);

    // Click Previous - step should decrement by 1
    await prevButton.click();
    const afterPrev = await getCurrentStep();
    expect(afterPrev).toBe(afterNext - 1);

    // Advance a few steps then Reset - should return to step 1
    await nextButton.click();
    await nextButton.click();
    await resetButton.click();
    const afterReset = await getCurrentStep();
    expect(afterReset).toBe(1);
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
