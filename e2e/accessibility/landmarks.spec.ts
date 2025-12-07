// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Accessibility - Landmarks", () => {
  test("screen-reader-landmarks", async ({ page }): Promise<void> => {
    // 1. Navigate to homepage
    await page.goto("/");

    // 2. Verify page has proper landmark regions
    // Check for a single header/banner landmark
    const header = page.locator("body > header, body > [role='banner']");
    await expect(header).toHaveCount(1);
    await expect(header).toBeVisible();

    // 3. Check for a single main landmark
    const main = page.locator("body > main, body > [role='main']");
    await expect(main).toHaveCount(1);
    await expect(main).toBeVisible();

    // 4. Check for a single footer/contentinfo landmark (exclude devtools)
    const footer = page.locator(
      "body > footer:not([class*='Devtools']), body > [role='contentinfo']:not([class*='Devtools'])",
    );
    await expect(footer).toHaveCount(1);
    await expect(footer).toBeVisible();
  });

  test("navigation-landmark", async ({ page }): Promise<void> => {
    await page.goto("/");

    // Target the primary navigation specifically (not any random nav)
    const primaryNav = page.locator("nav[aria-label='Primary navigation']");
    await expect(primaryNav).toBeVisible();

    // Primary navigation should contain links with accessible names
    const navLinks = primaryNav.getByRole("link");
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Validate each link has an accessible name
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const text = (await link.textContent())?.trim();
      const ariaLabel = (await link.getAttribute("aria-label"))?.trim();
      const title = (await link.getAttribute("title"))?.trim();
      expect(
        text || ariaLabel || title,
        `Link ${i} in primary navigation has no accessible name`,
      ).toBeTruthy();
    }
  });
});
