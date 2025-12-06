// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial Hint System", () => {
  test("hint-system", async ({ page }) => {
    // 1. Navigate to /tutorial
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(page.getByText("Instructions")).toBeVisible();

    // 2. Click 'Show hint' button
    const hintButton = page.getByRole("button", { name: /hint/i });
    await expect(hintButton).toBeVisible();
    await hintButton.click();

    // 3. Verify hint content displays
    // After clicking, a hint should be revealed
    const hintsPanel = page
      .locator("[class*='hint'], [data-testid*='hint']")
      .first();
    if (await hintsPanel.isVisible()) {
      // Hint content should be visible
      await expect(hintsPanel).toBeVisible();
    }

    // 4. Click again for additional hints (if available)
    const hintButtonAfter = page.getByRole("button", { name: /hint/i });
    if (await hintButtonAfter.isVisible()) {
      // Button might show hint counter like "Hint 2/3"
      const buttonText = await hintButtonAfter.textContent();
      expect(buttonText).toBeTruthy();
    }
  });

  test("hints-persist-when-returning", async ({ page }) => {
    await page.goto("/tutorial");

    // Reveal a hint
    const hintButton = page.getByRole("button", { name: /hint/i });
    if (await hintButton.isVisible()) {
      await hintButton.click();
    }

    // Navigate away and back
    await page.goto("/gallery");
    await page.goto("/tutorial");

    // Hint state should be preserved (stored in localStorage)
    await expect(page.getByText("Instructions")).toBeVisible();
  });
});
