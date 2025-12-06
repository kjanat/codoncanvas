// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Accessibility - Landmarks", () => {
  test("screen-reader-landmarks", async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto("/");

    // 2. Verify page has proper landmark regions
    // Check for banner (header)
    const header = page.locator("header, [role='banner']");
    await expect(header.first()).toBeVisible();

    // 3. Check for main content area
    const main = page.locator("main, [role='main']");
    await expect(main.first()).toBeVisible();

    // 4. Check for footer (contentinfo)
    const footer = page.locator("footer, [role='contentinfo']");
    await expect(footer.first()).toBeVisible();
  });

  test("navigation-landmark", async ({ page }) => {
    await page.goto("/");

    // Check for navigation landmark
    const nav = page.locator("nav, [role='navigation']");
    await expect(nav.first()).toBeVisible();

    // Navigation should contain links
    const navLinks = nav.first().getByRole("link");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
