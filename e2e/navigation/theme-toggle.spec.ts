// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Navigation - Theme Toggle", () => {
  test("theme-toggle", async ({ page }): Promise<void> => {
    // 1. Navigate to homepage
    await page.goto("/");

    // 2. Find theme toggle button
    const themeButton = page.getByRole("button", { name: /theme|dark|light/i });
    await expect(themeButton).toBeVisible();

    // Get initial theme state from document
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    // Initial theme is likely 'light' if system theme is light, or 'dark' if last used.
    // To ensure a change, click twice to go through the cycle.

    // 3. Click theme toggle first time (e.g., system -> light)
    await themeButton.click({ force: true });
    // 4. Click theme toggle second time (e.g., light -> dark)
    await themeButton.click({ force: true });

    // 5. Verify theme changes
    await expect
      .poll(async () => {
        return await page.evaluate(() =>
          document.documentElement.getAttribute("data-theme"),
        );
      })
      .not.toBe(initialTheme);

    // Theme should have changed (or cycled through system -> light -> dark)
    await expect(themeButton).toBeVisible();
  });

  test("theme-persists-across-navigation", async ({ page }): Promise<void> => {
    await page.goto("/");

    // Toggle to dark mode
    const themeButton = page.getByRole("button", { name: /theme|dark|light/i });
    await expect(themeButton).toBeVisible();
    await themeButton.click();

    const isDarkAfterToggle = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    // Navigate to another page
    await page.goto("/gallery");

    // Theme preference should persist (stored in localStorage)
    const themeButtonOnGallery = page.getByRole("button", {
      name: /theme|dark|light/i,
    });
    await expect(themeButtonOnGallery).toBeVisible();

    const isDarkOnGallery = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDarkOnGallery).toBe(isDarkAfterToggle);
  });
});
