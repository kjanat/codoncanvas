// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Accessibility - Landmarks", () => {
  test("screen-reader-landmarks", async ({ page }): Promise<void> => {
    // 1. Navigate to homepage
    await page.goto("/");

    // 2. Verify page has proper landmark regions
    // Check for a single header/banner landmark
    const header = page.locator("header, [role='banner']");
    await expect(header).toHaveCount(1);
    await expect(header).toBeVisible();

    // 3. Check for a single main landmark
    const main = page.locator("main, [role='main']");
    await expect(main).toHaveCount(1);
    await expect(main).toBeVisible();

    // 4. Check for a single footer/contentinfo landmark
    const footer = page.locator("footer:not([class*='Devtools'])");
    await expect(footer).toHaveCount(1);
    await expect(footer).toBeVisible();
  });

  test("navigation-landmark", async ({ page }): Promise<void> => {
    await page.goto("/");

    // Get all navigation landmarks
    const allNavs = page.locator("nav, [role='navigation']");
    const navCount = await allNavs.count();

    // Ensure at least one navigation landmark exists
    expect(navCount).toBeGreaterThan(0);

    // Validate each navigation landmark is visible and has accessible links
    for (let navIndex = 0; navIndex < navCount; navIndex++) {
      const nav = allNavs.nth(navIndex);
      await expect(nav).toBeVisible();

      // Navigation should contain links with accessible names
      const navLinks = nav.getByRole("link");
      const linkCount = await navLinks.count();

      // Each visible nav with links should have accessible link names
      if (linkCount > 0) {
        for (let i = 0; i < linkCount; i++) {
          const link = navLinks.nth(i);
          const text = (await link.textContent())?.trim();
          const ariaLabel = (await link.getAttribute("aria-label"))?.trim();
          const title = (await link.getAttribute("title"))?.trim();
          expect(text || ariaLabel || title).toBeTruthy();
        }
      }
    }
  });
});
