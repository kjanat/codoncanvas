// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Navigation - Theme Toggle", () => {
  test("theme-toggle", async ({ page }): Promise<void> => {
    await page.goto("/");

    const themeButton = page.getByRole("button", {
      name: /Toggle theme \((system|light|dark)\)/i,
    });
    await expect(themeButton).toBeVisible();

    // Capture initial theme state from DOM
    const initialIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    // Toggle theme
    await themeButton.click();

    // Verify DOM actually changed (theme class toggled)
    const newIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(newIsDark).not.toBe(initialIsDark);

    // Button text should still match expected pattern
    await expect(themeButton).toHaveText(
      /Toggle theme \((system|light|dark)\)/i,
    );
  });

  test("theme-persists-across-navigation", async ({ page }): Promise<void> => {
    await page.goto("/");

    // Toggle to dark mode
    const themeButton = page.getByRole("button", {
      name: /Toggle theme \((system|light|dark)\)/i,
    });
    await expect(themeButton).toBeVisible();
    await themeButton.click();

    const isDarkAfterToggle = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    // Navigate to another page
    await page.goto("/gallery");

    // Theme preference should persist (stored in localStorage)
    const themeButtonOnGallery = page.getByRole("button", {
      name: /Toggle theme \((system|light|dark)\)/i,
    });
    await expect(themeButtonOnGallery).toBeVisible();

    const isDarkOnGallery = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDarkOnGallery).toBe(isDarkAfterToggle);
  });
});
