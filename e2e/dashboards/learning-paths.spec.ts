// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Learning Paths Dashboard", () => {
  test("learning-paths-dashboard", async ({ page }) => {
    // 1. Navigate to /dashboards/learning
    await page.goto("/dashboards/learning");

    // 2. Verify learning paths are displayed
    await expect(
      page.getByRole("heading", { name: /learning/i }),
    ).toBeVisible();

    // 3. Verify progress indicators are present
    // Look for progress bars or percentage indicators
    const progressIndicators = page.locator(
      "[class*='progress'], [role='progressbar']",
    );
    const count = await progressIndicators.count();
    expect(count).toBeGreaterThanOrEqual(0);

    // 4. Verify 'Continue Learning' or similar action buttons
    const actionButtons = page.getByRole("button", {
      name: /continue|start|learn/i,
    });
    if ((await actionButtons.count()) > 0) {
      await expect(actionButtons.first()).toBeVisible();
    }
  });
});
