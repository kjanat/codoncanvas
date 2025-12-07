// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Teacher Dashboard Empty State", () => {
  test("empty-state-message-visible", async ({ page }): Promise<void> => {
    // 1. Navigate to /dashboards/teacher
    await page.goto("/dashboards/teacher");

    // 2. Verify page heading
    await expect(
      page.getByRole("heading", { name: "Teacher Dashboard" }),
    ).toBeVisible();

    // 3. Verify empty state heading
    await expect(
      page.getByRole("heading", { name: "No Student Data Imported" }),
    ).toBeVisible();

    // 4. Verify helpful instruction text
    await expect(
      page.getByText(
        "Import student progress JSON files or load demo data to get started.",
      ),
    ).toBeVisible();
  });

  test("import-files-button-visible", async ({ page }): Promise<void> => {
    await page.goto("/dashboards/teacher");

    // Verify "Import Files" label/button in header area
    await expect(page.getByText("Import Files")).toBeVisible();

    // Verify "Import Student Files" button in empty state CTA
    await expect(page.getByText("Import Student Files")).toBeVisible();
  });

  test("load-demo-data-button-visible", async ({ page }): Promise<void> => {
    await page.goto("/dashboards/teacher");

    // Verify "Load Demo Data" buttons are visible (header and empty state CTA)
    const demoButtons = page.getByRole("button", { name: "Load Demo Data" });
    await expect(demoButtons.nth(0)).toBeVisible();
    await expect(demoButtons.nth(1)).toBeVisible();
  });
});
