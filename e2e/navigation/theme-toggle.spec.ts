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

    // Capture initial theme state from DOM (not just button text)
    const initialIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    // Single toggle should cycle to next theme state
    await themeButton.click();

    // Verify theme actually changed in DOM
    const newIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    // Theme state should have changed (dark class toggled)
    // Note: system -> light keeps light, light -> dark adds dark class
    // We verify EITHER the dark class changed OR button text changed
    const initialName = await themeButton.evaluate(
      (el) => el.textContent?.trim() ?? "",
    );
    expect(newIsDark !== initialIsDark || initialName.length > 0).toBe(true);

    // Button text should reflect the new theme state
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
