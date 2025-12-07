// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial Navigation", () => {
  test("navigate-between-lessons", async ({ page }): Promise<void> => {
    // 1. Navigate to /tutorial
    await page.goto("/tutorial");

    // Get initial lesson title
    const initialTitle = await page
      .getByRole("heading", { level: 2 })
      .textContent();

    // 2. Click on a different lesson in the sidebar
    // Find lesson buttons in sidebar and click the second one
    const lessonButtons = page
      .locator("button")
      .filter({ hasText: /^\d+$|^\u2713$/ });
    const secondLesson = lessonButtons.nth(1);
    await secondLesson.click();

    // 3. Verify lesson content updates
    const newTitle = await page
      .getByRole("heading", { level: 2 })
      .textContent();
    expect(newTitle).not.toBe(initialTitle);

    // 4. Verify code editor resets for new lesson
    await expect(page.getByText("Your Code")).toBeVisible();
  });

  test("mobile-sidebar-toggle", async ({ page }): Promise<void> => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/tutorial");

    // On mobile, sidebar should be hidden initially
    // Look for menu button (FAB) to open sidebar
    const menuButton = page.getByRole("button", { name: /menu|lessons/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Sidebar should now be visible
      await expect(page.getByText("Module 1")).toBeVisible();

      // Close sidebar
      const closeButton = page.getByRole("button", { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });
});
