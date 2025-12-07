// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("File Operations", () => {
  test("share-link-generation", async ({ page, context, isMobile }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify genome code is present
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toHaveValue("ATG GAA AAT GGA TAA");

    // 3. Click 'Share' button (via overflow menu on mobile)
    if (isMobile) {
      await page.getByRole("button", { name: "More actions" }).click();
      await page.getByRole("button", { name: "Share" }).click();
    } else {
      await page.getByRole("button", { name: "Copy shareable link" }).click();
    }

    // 4. Verify shareable link is generated/copied to clipboard
    const clipboardContent = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardContent).toMatch(/^https?:\/\/.+/);
    expect(clipboardContent).toContain("genome=");
  });
});
