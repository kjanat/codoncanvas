// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Teacher Dashboard", () => {
  test("teacher-dashboard-empty-state", async ({ page }): Promise<void> => {
    // 1. Navigate to /dashboards/teacher
    await page.goto("/dashboards/teacher");

    // 2. Verify page loads
    await expect(
      page.getByRole("heading", { name: "Teacher Dashboard" }),
    ).toBeVisible();

    // 3. Verify empty state message or data import options
    await expect(
      page.getByRole("heading", { name: /No Student Data Imported/i }),
    ).toBeVisible();
  });

  test("teacher-dashboard-load-demo", async ({ page }): Promise<void> => {
    await page.goto("/dashboards/teacher");

    // Click the 'Load Demo Data' button in the empty state section
    // Wait for the empty state heading first to ensure we're targeting the right button
    await expect(
      page.getByRole("heading", { name: /No Student Data Imported/i }),
    ).toBeVisible();

    // Now click the button that appears after the empty state message
    const demoButton = page
      .getByRole("button", { name: "Load Demo Data" })
      .last();
    await expect(demoButton).toBeVisible();
    await demoButton.click();

    // Dashboard should populate with data - wait for engagement table to appear
    // The table has a caption "Student engagement metrics..."
    const engagementTable = page.getByRole("table", {
      name: /Student engagement metrics/i,
    });
    await expect(engagementTable).toBeVisible({ timeout: 5000 });

    // Verify table has data rows (at least one student)
    const rows = engagementTable.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });
});
