// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Learning Paths Dashboard", () => {
  test("learning-paths-dashboard", async ({ page }): Promise<void> => {
    // 1. Navigate to /dashboards/learning
    await page.goto("/dashboards/learning");

    // 2. Verify learning paths are displayed
    await expect(
      page.getByRole("heading", { name: /learning/i }),
    ).toBeVisible();

    // 3. Verify progress indicators or learning content is present
    // Look for progress bars, percentage indicators, or learning modules
    const learningContent = page.getByRole("progressbar");
    // At least one learning content element should be present
    await expect(learningContent.first()).toBeVisible({ timeout: 5000 });

    // 4. Verify 'Continue Learning' or similar action buttons
    await expect(
      page
        .getByRole("link", {
          name: /continue|start|learn/i,
        })
        .first(),
    ).toBeVisible();
  });
});
