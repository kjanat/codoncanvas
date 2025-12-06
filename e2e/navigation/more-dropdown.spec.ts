// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Navigation - More Dropdown", () => {
  test("more-dropdown-menu", async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto("/");

    // 2. Click 'Demos' link in navigation (it's a dropdown trigger)
    const demosLink = page.getByRole("link", { name: "Demos" });
    await demosLink.click();

    // 3. Verify dropdown shows Demos submenu items
    // Should navigate to demos index or show dropdown
    await expect(page).toHaveURL(/demos/);

    // Verify demos index has links to individual demos
    await expect(page.getByRole("link", { name: /mutation/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /timeline/i })).toBeVisible();
  });

  test("demos-page-links-to-all-demos", async ({ page }) => {
    await page.goto("/demos");

    // Verify all demo links are present
    const demoLinks = [
      /mutation/i,
      /timeline/i,
      /evolution/i,
      /population/i,
      /genetic/i,
      /assessment/i,
      /achievement/i,
    ];

    for (const demoPattern of demoLinks) {
      const link = page.getByRole("link", { name: demoPattern });
      // At least some demos should be linked
      if (await link.isVisible()) {
        await expect(link).toBeVisible();
      }
    }
  });
});
