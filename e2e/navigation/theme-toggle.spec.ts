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

    // Capture initial theme from button text
    const initialText = await themeButton.textContent();
    const initialThemeMatch = initialText?.match(/\((system|light|dark)\)/i);
    const initialTheme = initialThemeMatch?.[1]?.toLowerCase();

    // Toggle theme - cycles: light -> dark -> system -> light
    await themeButton.click();

    // Verify button text changed to next theme in cycle
    const expectedNextTheme =
      initialTheme === "light"
        ? "dark"
        : initialTheme === "dark"
          ? "system"
          : "light";

    await expect(themeButton).toHaveText(
      new RegExp(`Toggle theme \\(${expectedNextTheme}\\)`, "i"),
    );

    // Verify data-theme attribute is set on document
    const dataTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(dataTheme).toMatch(/^(light|dark)$/);
  });

  test("theme-persists-across-navigation", async ({ page }): Promise<void> => {
    await page.goto("/");

    // Toggle theme (capture resulting state)
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
