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
    const editorValue = await editor.inputValue();
    expect(editorValue.length).toBeGreaterThan(0);
    // Should contain starter code for lesson 2
    expect(editorValue).toContain("GAA AAT GGA");
  });
});

test.describe("Mobile Tutorial", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  // FIXME: Application bug - Sidebar does not close.
  // Verified failures with: standard click, force click, backdrop click, and Escape key.
  // The internal state 'isOpen' seems to be stuck or reset immediately.
  test.fixme("mobile-sidebar-toggle", async ({ page }): Promise<void> => {
    await page.goto("/tutorial");

    // Open mobile sidebar (ModuleSidebar FAB)
    const menuButton = page.getByRole("button", { name: "Open lesson menu" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Sidebar should now be visible (Header "Lessons")
    await expect(page.getByRole("heading", { name: "Lessons" })).toBeVisible();

    // Wait for sidebar animation to complete
    await page.waitForTimeout(500);

    // Close sidebar
    const closeButton = page
      .locator("main")
      .getByRole("button", { name: "Close menu" });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(closeButton).not.toBeVisible();
  });
});
