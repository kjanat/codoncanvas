// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Research Dashboard", () => {
  test("research-dashboard-loads", async ({ page }) => {
    // 1. Navigate to /dashboards/research
    await page.goto("/dashboards/research");

    // 2. Verify research analytics interface loads
    await expect(
      page.getByRole("heading", { name: /research|analytics/i }),
    ).toBeVisible();

    // 3. Verify metrics or data visualization present
    // Research dashboards typically have charts or data panels
    const dataElements = page.locator(
      "[class*='chart'], [class*='metric'], [class*='stat'], canvas, svg",
    );
    // At least one data visualization element should be present
    await expect(dataElements.first()).toBeVisible({ timeout: 5000 });
  });
});
