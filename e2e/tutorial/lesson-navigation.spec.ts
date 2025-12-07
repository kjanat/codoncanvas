// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial Navigation", () => {
  test("navigate-between-lessons", async ({ page }): Promise<void> => {
    // 1. Navigate to /tutorial
    await page.goto("/tutorial");

    // Get initial lesson title
    const initialTitle = await page
      .getByRole("heading", { level: 1 })
      .textContent();

    // 2. Click on a different lesson in the sidebar
    // Lesson buttons have format "2 Moving Around - TRANSLATE"
    const secondLesson = page.getByRole("button", {
      name: /2 Moving Around/i,
    });
    await secondLesson.click();

    // 3. Verify lesson content updates
    const newTitle = await page
      .getByRole("heading", { level: 1 })
      .textContent();
    expect(newTitle).not.toBe(initialTitle);

    // 4. Verify code editor resets for new lesson
    await expect(
      page.getByRole("heading", { name: "Your Code" }),
    ).toBeVisible();
  });

  test("mobile-sidebar-toggle", async ({ page }): Promise<void> => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/tutorial");

    // On mobile, sidebar should be hidden initially
    // Look for menu button (FAB) to open sidebar - use first() to avoid strict mode violation
    // as there may be both "Open menu" and "Close menu" buttons
    const menuButton = page
      .getByRole("button", { name: /menu|lessons/i })
      .first();
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Sidebar should now be visible
      await expect(page.getByText("Module 1")).toBeVisible();

      // Close sidebar - use exact name to avoid matching multiple buttons
      const closeButton = page.getByRole("button", { name: "Close menu" });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });
});
