import { expect, test } from "@playwright/test";

/**
 * Seed test for CodonCanvas E2E tests.
 * This file serves as the base template for test generation
 * and ensures the application loads correctly.
 */
test.describe("CodonCanvas Seed", () => {
  test("application loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CodonCanvas/);
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toBeVisible();
  });
});
