// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";
import { DEFAULT_GENOME } from "../support/constants";

test.describe("File Operations", () => {
  test("copy-genome-code", async ({
    page,
    context,
    isMobile,
    browserName,
  }): Promise<void> => {
    // Grant clipboard permissions - only supported in Chromium
    // Firefox and WebKit don't support clipboard-read permission
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify genome code is present
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });
    await expect(genomeEditor).toHaveValue(DEFAULT_GENOME);

    if (isMobile) {
      // 3. Open overflow menu and click Copy
      await page.getByRole("button", { name: "More actions" }).click();
      const copyButton = page.getByTestId("mobile-menu-copy");
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

      // Read clipboard only in Chromium where it's supported
      if (browserName === "chromium") {
        const clipboardContent = await page.evaluate(() =>
          navigator.clipboard.readText(),
        );
        expect(clipboardContent).toBe(DEFAULT_GENOME);
      }
    }
  });
});
