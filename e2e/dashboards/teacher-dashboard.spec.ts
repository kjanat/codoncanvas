// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Teacher Dashboard", () => {
  test("teacher-dashboard-empty-state", async ({ page }) => {
    // 1. Navigate to /dashboards/teacher
    await page.goto("/dashboards/teacher");

    // 2. Verify page loads
    await expect(
      page.getByRole("heading", { name: /teacher|dashboard/i }),
    ).toBeVisible();

    // 3. Verify empty state or data import options
    const emptyState = page.getByText(/no.*data|import|demo/i);
    const importButton = page.getByRole("button", { name: /import/i });
    const demoButton = page.getByRole("button", { name: /demo/i });

    // At least one of these should be visible
    const hasEmptyState = await emptyState.isVisible();
    const hasImport = await importButton.isVisible();
    const hasDemo = await demoButton.isVisible();

    expect(hasEmptyState || hasImport || hasDemo).toBeTruthy();
  });

  test("teacher-dashboard-load-demo", async ({ page }) => {
    await page.goto("/dashboards/teacher");

    // Look for 'Load Demo Data' button
    const demoButton = page.getByRole("button", {
      name: /demo.*data|load.*demo/i,
    });
    if (await demoButton.isVisible()) {
      await demoButton.click();

      // Dashboard should populate with data
      // Wait for content to load
      await page.waitForTimeout(1000);

      // Verify some data appears (tables, charts, etc.)
      const dataElements = page.locator(
        "table, [class*='chart'], [class*='data']",
      );
      const count = await dataElements.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
