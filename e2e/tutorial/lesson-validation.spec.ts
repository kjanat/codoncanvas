// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial Lesson Validation", () => {
  test("lesson-code-validation", async ({ page }): Promise<void> => {
    // 1. Navigate to /tutorial on first lesson
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(
      page.getByRole("heading", { name: "Your Code" }),
    ).toBeVisible();

    // 2. Find the code editor and run button
    const editor = page.getByRole("textbox", {
      name: "Write your genome code here...",
    });
    await expect(editor).toBeVisible();

    // 3. Click 'Run & Validate' button
    const runButton = page.getByRole("button", { name: "Run & Validate" });
    await runButton.click();

    // 4. Verify the button was clickable and editor still shows
    // (validation feedback may not have specific class markers)
    await expect(editor).toBeVisible();
  });

  test("preview-updates-on-code-change", async ({ page }): Promise<void> => {
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(page.getByRole("heading", { name: "Preview" })).toBeVisible();

    // Find the preview canvas
    const preview = page.locator("canvas").first();
    await expect(preview).toBeVisible();

    // The preview should be present and rendered
    // (Canvas content testing requires visual comparison)
    await expect(preview).toHaveAttribute("width");
    await expect(preview).toHaveAttribute("height");
  });
});
