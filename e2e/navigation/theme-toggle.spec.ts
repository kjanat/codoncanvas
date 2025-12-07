// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Navigation - Theme Toggle", () => {
  test("theme-toggle", async ({ page }): Promise<void> => {
    await page.goto("/");

    // Button name includes current theme: "Toggle theme (system|light|dark)"
    const themeButton = page.getByRole("button", {
      name: /Toggle theme \((system|light|dark)\)/i,
    });
    await expect(themeButton).toBeVisible();

    // Capture initial button text to verify theme name changes
    const initialText = await themeButton.textContent();

    // Single toggle should cycle to next theme state (light -> dark -> system)
    await themeButton.click();

    // Button text should change to reflect the new theme
    const newText = await themeButton.textContent();
    expect(newText).not.toBe(initialText);

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
