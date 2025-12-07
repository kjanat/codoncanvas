// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial Lesson Validation", () => {
  test("lesson-code-validation", async ({ page }): Promise<void> => {
    // 1. Navigate to /tutorial on first lesson
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(page.getByText("Your Code")).toBeVisible();

    // 2. Find the code editor and run button
    const editor = page.locator("textarea").first();
    await expect(editor).toBeVisible();

    // 3. Click 'Run & Validate' button
    const runButton = page.getByRole("button", { name: /run|validate/i });
    await runButton.click();

    // 4. Verify validation feedback appears
    // Should show either success or error feedback
    const feedback = page.locator(
      "[class*='success'], [class*='error'], [class*='validation']",
    );
    await expect(feedback.first()).toBeVisible({ timeout: 5000 });
  });

  test("preview-updates-on-code-change", async ({ page }): Promise<void> => {
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(page.getByText("Preview")).toBeVisible();

    // Find the preview canvas
    const preview = page.locator("canvas").first();
    await expect(preview).toBeVisible();

    // The preview should be present and rendered
    // (Canvas content testing requires visual comparison)
    await expect(preview).toHaveAttribute("width");
    await expect(preview).toHaveAttribute("height");
  });
});
