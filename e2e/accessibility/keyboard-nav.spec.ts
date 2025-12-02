// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("keyboard-navigation", async ({ page }) => {
    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify interactive elements are focusable
    const editor = page.getByRole("textbox", { name: "Genome editor" });

    // Navigate to editor and verify it can be focused
    await editor.focus();
    await expect(editor).toBeFocused();

    // 3. Verify buttons can be focused and activated
    const runButton = page.getByRole("button", { name: "Run genome" });
    await runButton.focus();
    await expect(runButton).toBeFocused();

    // Press Enter to activate button
    await page.keyboard.press("Enter");

    // Verify button was activated (canvas should be visible)
    await expect(
      page.getByRole("img", { name: "Genome execution output" }),
    ).toBeVisible();

    // 4. Verify navigation links are accessible via keyboard
    const galleryLink = page.getByRole("link", { name: "Gallery" });
    await galleryLink.focus();
    await expect(galleryLink).toBeFocused();
  });
});
