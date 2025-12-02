import { expect, test } from "@playwright/test";

/**
 * Example E2E tests for CodonCanvas.
 * These serve as basic smoke tests to ensure the application works.
 */

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CodonCanvas/);
});

test("playground has essential elements", async ({ page }) => {
  await page.goto("/");

  // Verify editor is present
  await expect(
    page.getByRole("textbox", { name: "Genome editor" }),
  ).toBeVisible();

  // Verify Run button is present
  await expect(page.getByRole("button", { name: "Run genome" })).toBeVisible();

  // Verify canvas output area is present
  await expect(page.getByText("Output")).toBeVisible();
});
