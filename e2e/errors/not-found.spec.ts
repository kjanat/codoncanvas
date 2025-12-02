// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Error Handling", () => {
  test("404-not-found-page", async ({ page }) => {
    // 1. Navigate to non-existent route
    await page.goto("/nonexistent-page-that-does-not-exist");

    // 2. Verify 404 page displays
    // Check for NotFound component indicators
    await expect(page.getByText(/not found/i)).toBeVisible();

    // 3. Verify user can navigate back to valid routes
    // Look for a home link or navigation
    const homeLink = page.getByRole("link", { name: "CodonCanvas" });
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL("/");
    }
  });
});
