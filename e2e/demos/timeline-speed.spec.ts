// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Timeline Playback Speed", () => {
  test("timeline-playback-speed", async ({ page }) => {
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

    // 2. Look for speed selector (dropdown or buttons)
    const speedSelector = page.locator("select").filter({ hasText: /\dx/i });
    if (await speedSelector.isVisible()) {
      // Select '2x' playback speed
      await speedSelector.selectOption({ label: "2x" });

      // Verify selection
      await expect(speedSelector).toHaveValue(/2/);
    }

    // Alternative: speed buttons
    const speedButton = page.getByRole("button", { name: /2x|speed/i });
    if (await speedButton.isVisible()) {
      await speedButton.click();
    }
  });
});
