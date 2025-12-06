// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Navigation - Footer", () => {
  test("footer-content", async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto("/");

    // 2. Scroll to page footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 3. Verify CodonCanvas branding in footer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Should contain CodonCanvas text
    await expect(footer.getByText(/codoncanvas/i)).toBeVisible();

    // 4. Verify creator attribution link
    const creatorLink = footer.getByRole("link", { name: /kjanat/i });
    if (await creatorLink.isVisible()) {
      await expect(creatorLink).toHaveAttribute("href", /github\.com\/kjanat/);
    }
  });
});
