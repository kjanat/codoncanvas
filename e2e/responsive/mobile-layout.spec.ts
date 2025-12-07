// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Responsive Design", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile-viewport-layout", async ({ page }): Promise<void> => {
    // 1. Navigate to main pages
    await page.goto("/");

    // 3. Verify layout adapts appropriately
    // Editor should still be visible
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toBeVisible();

    // Canvas output should still be visible
    await expect(
      page.getByRole("img", { name: "Genome execution output" }),
    ).toBeVisible();

    // Run button should still be accessible
    await expect(
      page.getByRole("button", { name: "Run genome" }),
    ).toBeVisible();

    // Visit gallery route at mobile viewport
    await page.goto("/gallery");
    await expect(
      page.getByRole("heading", { name: "Example Gallery" }),
    ).toBeVisible();

    // Verify search is accessible on mobile
    await expect(
      page.getByRole("searchbox", { name: "Search examples..." }),
    ).toBeVisible();
  });
});
