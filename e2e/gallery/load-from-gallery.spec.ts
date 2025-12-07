// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Example Gallery", () => {
  test("load-example-from-gallery", async ({ page }): Promise<void> => {
    // 1. Navigate to /gallery
    await page.goto("/gallery");

    // 2. Click on the first example card (structure-based, not copy-based)
    const firstExample = page
      .locator("main")
      .getByRole("button")
      .filter({ has: page.locator("h3") })
      .first();
    await firstExample.click();

    // This should open a preview modal with "Open in Playground" button
    // Button has aria-label like "Open {title} in Playground"
    const openButton = page.getByRole("button", {
      name: /Open .* in Playground/i,
    });
    await expect(openButton).toBeVisible();

    // Click the Open in Playground button
    await openButton.click();

    // 3. Verify navigation to playground with example parameter
    await expect(page).toHaveURL(/example=/);

    // 4. Verify we're on the playground page
    const editor = page.getByRole("textbox", { name: "Genome editor" });
    await expect(editor).toBeVisible();

    // Verify the editor has content (not empty)
    const editorValue = await editor.inputValue();
    expect(editorValue.length).toBeGreaterThan(0);
  });
});
