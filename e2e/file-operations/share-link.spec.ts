// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";
import { DEFAULT_GENOME } from "../support/constants";

test.describe("File Operations", () => {
  test("share-link-generation", async ({
    page,
    context,
    isMobile,
    browserName,
  }): Promise<void> => {
    // Clipboard read is only supported in Chromium; Firefox/WebKit rely on UI feedback
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await page.goto("/");

    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toHaveValue(DEFAULT_GENOME);

    // Click Share button (via overflow menu on mobile)
    if (isMobile) {
      await page.getByRole("button", { name: "More actions" }).click();
      await page.getByRole("button", { name: "Share" }).click();
    } else {
      await page.getByRole("button", { name: "Copy shareable link" }).click();
    }

    // Verify share action completed - button remains accessible
    if (isMobile) {
      await expect(
        page.getByRole("button", { name: "More actions" }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("button", { name: "Copy shareable link" }),
      ).toBeVisible();
    }

    // Validate clipboard content in Chromium
    if (browserName === "chromium") {
      try {
        const clipboardContent = await page.evaluate(() =>
          navigator.clipboard.readText(),
        );
        expect(clipboardContent).toMatch(/^https?:\/\/.+/);
        expect(clipboardContent).toContain("?g=");
      } catch (error) {
        throw new Error(
          `Clipboard read failed in Chromium - this may indicate a CI permission issue: ${error}`,
        );
      }
    }
  });
});
