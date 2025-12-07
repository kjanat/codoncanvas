// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Timeline Playback Speed", () => {
  test("timeline-playback-speed", async ({ page }): Promise<void> => {
    // 1. Navigate and capture timeline
    await page.goto("/demos/timeline");

    const captureButton = page.getByRole("button", {
      name: /run.*capture|capture.*timeline/i,
    });
    await captureButton.click();

    // Wait for timeline to be ready
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible({
      timeout: 10000,
    });

    // Speed selector (dropdown with 0.5x, 1x, 2x, 5x options)
    const speedSelector = page.locator("select").filter({ hasText: /\dx/i });
    const selectorVisible = await speedSelector.isVisible();

    if (selectorVisible) {
      // Select '2x' playback speed (value 250ms delay)
      await speedSelector.selectOption({ label: "2x" });

      // Verify selection shows 2x
      await expect(speedSelector).toHaveValue("250");
    } else {
      // Alternative: speed buttons (if UI variant exists)
      const speedButton = page.getByRole("button", { name: /2x|speed/i });
      const buttonVisible = await speedButton.isVisible();

      // Fail if neither control exists
      expect(selectorVisible || buttonVisible).toBe(true);

      if (buttonVisible) {
        await speedButton.click();

        // Verify speed changed - check for 2x indicator or aria state
        const speedIndicator = page.getByText(/2x/).first();
        await expect(speedIndicator).toBeVisible();
      }
    }
  });
});
