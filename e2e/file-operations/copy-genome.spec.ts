// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("File Operations", () => {
  test("copy-genome-code", async ({ page, context, isMobile }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify genome code is present
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });
    await expect(genomeEditor).toHaveValue("ATG GAA AAT GGA TAA");

    if (isMobile) {
      // 3. Open overflow menu and click Copy
      await page.getByRole("button", { name: "More actions" }).click();
      // Use more specific selector - the menu button
      const copyButton = page.locator(
        'button:has-text("Copy"):not([aria-label])',
      );
      await copyButton.click();

      // 4. Reopen menu to verify copied state
      await page.getByRole("button", { name: "More actions" }).click();
      // Check the menu button shows "Copied!"
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
    } else {
      // 3. Click 'Copy' button
      await page.getByRole("button", { name: "Copy genome code" }).click();

      // 4. Verify button shows feedback (copied state)
      await expect(
        page.getByRole("button", { name: "Copied to clipboard" }),
      ).toBeVisible();
    }
  });
});
