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
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
      initialTitle ?? "",
    );

    // 4. Verify code editor resets for new lesson
    const editor = page.getByRole("textbox", { name: /code/i });
    // Should contain starter code for lesson 2 (auto-waits for content)
    await expect(editor).toHaveValue(/GAA AAT GGA/);
  });
});

test.describe("Mobile Tutorial", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile-sidebar-toggle", async ({ page }): Promise<void> => {
    await page.goto("/tutorial");

    const drawer = page.getByTestId("lesson-sidebar-drawer");

    // Open mobile sidebar (ModuleSidebar FAB)
    const menuButton = page.getByRole("button", { name: "Open lesson menu" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Sidebar should now be visible (Header "Lessons")
    await expect(page.getByRole("heading", { name: "Lessons" })).toBeVisible();
    await expect(drawer).toHaveAttribute("data-open", "true");

    // Close sidebar
    const closeButton = drawer.getByRole("button", { name: "Close menu" });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    // Drawer is conditionally rendered, so it should not be visible when closed
    await expect(drawer).not.toBeVisible();
  });
});
