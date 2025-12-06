// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial System", () => {
  test("tutorial-page-structure", async ({ page }) => {
    // 1. Navigate to /tutorial
    await page.goto("/tutorial");

    // 2. Verify lesson sidebar with modules
    // Check for module headings (Module 1, 2, 3)
    await expect(page.getByText("Module 1")).toBeVisible();
    await expect(page.getByText("Module 2")).toBeVisible();
    await expect(page.getByText("Module 3")).toBeVisible();

    // 3. Verify progress indicator shows initial state
    await expect(page.getByText("Overall Progress")).toBeVisible();
    await expect(page.getByText(/\d+\/\d+ lessons/)).toBeVisible();

    // 4. Verify first lesson content loads
    // Check for lesson content area
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();

    // Check for key lesson components
    await expect(page.getByText("Instructions")).toBeVisible();
    await expect(page.getByText("Your Code")).toBeVisible();
    await expect(page.getByText("Preview")).toBeVisible();
  });
});
