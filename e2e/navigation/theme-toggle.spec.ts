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

    // Capture initial accessible name
    const initialName = await themeButton.evaluate(
      (el) => el.textContent?.trim() ?? "",
    );

    // Single toggle should cycle to next theme state
    await themeButton.click();

    // Button text should change after toggle (system -> light -> dark cycle)
    const newName = await themeButton.evaluate(
      (el) => el.textContent?.trim() ?? "",
    );
    expect(newName).not.toBe(initialName);
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
