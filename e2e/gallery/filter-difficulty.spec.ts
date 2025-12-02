// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Example Gallery", () => {
  test("filter-by-difficulty", async ({ page }) => {
    // 1. Navigate to /gallery
    await page.goto("/gallery");

    // Verify initial state shows all examples
    await expect(
      page.getByRole("radio", { name: "All Examples" }),
    ).toBeChecked();

    // 2. Click 'Beginner' label (since the radio input is sr-only)
    await page.getByText("Beginner", { exact: true }).click();

    // 3. Verify only beginner examples shown
    await expect(page.getByText("beginner").first()).toBeVisible();

    // Verify Hello Circle (beginner) is visible
    await expect(
      page.getByRole("heading", { name: "Hello Circle" }),
    ).toBeVisible();

    // 4. Click 'Advanced' label
    await page.getByText("Advanced", { exact: true }).click();

    // 5. Verify only advanced examples shown
    await expect(page.getByText("advanced").first()).toBeVisible();

    // Verify an advanced example is visible (Mandala Pattern is advanced)
    await expect(
      page.getByRole("heading", { name: "Mandala Pattern" }),
    ).toBeVisible();

    // 6. Click 'All Examples' to reset
    await page.getByText("All Examples", { exact: true }).click();

    // Verify filter is reset
    await expect(
      page.getByRole("radio", { name: "All Examples" }),
    ).toBeChecked();
    await expect(page.getByText("Browse 39 examples")).toBeVisible();
  });
});
