// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Navigation - GitHub Link", () => {
  test("github-link", async ({ page }): Promise<void> => {
    // 1. Navigate to homepage
    await page.goto("/");

    // 2. Verify GitHub link in header
    const githubLink = page.getByRole("link", { name: /github/i });
    await expect(githubLink).toBeVisible();

    // 3. Verify link points to repository
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/kjanat/codoncanvas",
    );

    // 4. Verify link opens in new tab
    await expect(githubLink).toHaveAttribute("target", "_blank");
  });
});
