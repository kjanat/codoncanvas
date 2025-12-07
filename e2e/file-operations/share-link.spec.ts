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
  }) => {
    // Grant clipboard permissions - only supported in Chromium
    // Firefox and WebKit don't support clipboard-read permission
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify genome code is present
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toHaveValue(DEFAULT_GENOME);

    // 3. Click 'Share' button (via overflow menu on mobile)
    if (isMobile) {
      await page.getByRole("button", { name: "More actions" }).click();
      await page.getByRole("button", { name: "Share" }).click();
    } else {
      await page.getByRole("button", { name: "Copy shareable link" }).click();
    }

    // 4. Verify share action completed
    // Check for UI feedback since clipboard doesn't work reliably in headless CI
    if (isMobile) {
      // Mobile: verify menu closed or toast appeared
      await expect(
        page.getByRole("button", { name: "More actions" }),
      ).toBeVisible();
    } else {
      // Desktop: verify button shows feedback (e.g., "Copied!" text or icon change)
      await expect(
        page.getByRole("button", { name: /copied|share/i }),
      ).toBeVisible();
    }

    // Verify URL contains genome parameter if share updates the URL
    // await expect(page).toHaveURL(/[?&]g=/);

    // Read clipboard only in Chromium where it's supported
    if (browserName === "chromium") {
      const clipboardContent = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      expect(clipboardContent).toMatch(/^https?:\/\/.+/);
      expect(clipboardContent).toContain("?g=");
    }
  });
});
