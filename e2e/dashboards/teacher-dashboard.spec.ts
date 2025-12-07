// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Teacher Dashboard", () => {
  test("teacher-dashboard-empty-state", async ({ page }): Promise<void> => {
    // 1. Navigate to /dashboards/teacher
    await page.goto("/dashboards/teacher");

    // 2. Verify page loads
    await expect(
      page.getByRole("heading", { name: /teacher|dashboard/i }),
    ).toBeVisible();

    // 3. Verify empty state message or data import options
    await expect(
      page.getByRole("heading", { name: "No Student Data Imported" }),
    ).toBeVisible();
  });

  test("teacher-dashboard-load-demo", async ({ page }): Promise<void> => {
    await page.goto("/dashboards/teacher");

    // Look for 'Load Demo Data' button
    const demoButton = page.getByRole("button", {
      name: /demo.*data|load.*demo/i,
    });
    if (await demoButton.isVisible()) {
      await demoButton.click();

      // Dashboard should populate with data - wait for table or chart to appear
      const dataElements = page.locator(
        "table, [class*='chart'], [class*='data']",
      );
      await expect(dataElements.first()).toBeVisible({ timeout: 5000 });

      // Verify data elements are present
      const count = await dataElements.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
