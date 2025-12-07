// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Timeline Capture", () => {
  test("run-and-capture-timeline", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/timeline
    await page.goto("/demos/timeline");

    // 2. Click 'Run & Capture Timeline' button
    const captureButton = page.getByRole("button", {
      name: /run.*capture|capture.*timeline/i,
    });
    await captureButton.click();

    // 3. Verify timeline controls appear
    // Wait for timeline to be captured
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible({
      timeout: 10000,
    });

    // 4. Verify VM state updates with execution data
    // Should show position, rotation, color, stack info
    const vmStatePanel = page.locator("[class*='state'], [class*='panel']");
    await expect(vmStatePanel.first()).toBeVisible();
  });

  test("timeline-shows-step-count", async ({ page }): Promise<void> => {
    await page.goto("/demos/timeline");

    // Capture timeline
    const captureButton = page.getByRole("button", {
      name: /run.*capture|capture.*timeline/i,
    });
    await captureButton.click();

    // Step counter should show format "Step X of Y"
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible({
      timeout: 10000,
    });
  });
});
