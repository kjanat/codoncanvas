// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Example Gallery", () => {
  test("load-example-from-gallery", async ({ page }) => {
    // 1. Navigate to /gallery
    await page.goto("/gallery");

    // 2. Click on 'Fibonacci Spiral' example card
    await page.getByRole("button", { name: /Fibonacci Spiral/ }).click();

    // This should open a preview modal
    await expect(
      page.getByRole("button", { name: "Open in Playground" }),
    ).toBeVisible();

    // Click the Open in Playground button
    await page.getByRole("button", { name: "Open in Playground" }).click();

    // 3. Verify navigation to playground with example parameter
    await expect(page).toHaveURL(/example=/);

    // 4. Verify we're on the playground page
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toBeVisible();

    // Verify the editor has content (not empty)
    const editorValue = await page
      .getByRole("textbox", { name: "Genome editor" })
      .inputValue();
    expect(editorValue.length).toBeGreaterThan(0);
  });
});
