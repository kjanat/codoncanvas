// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Example Gallery", () => {
  test("gallery-page-loads", async ({ page }) => {
    // 1. Navigate to /gallery
    await page.goto("/gallery");

    // 2. Verify page heading 'Example Gallery'
    await expect(
      page.getByRole("heading", { name: "Example Gallery" }),
    ).toBeVisible();

    // 3. Verify example count displays correctly
    await expect(page.getByText("Browse 39 examples")).toBeVisible();

    // 4. Verify example cards are visible
    // Check first example card has title
    await expect(
      page.getByRole("heading", { name: "Hello Circle" }),
    ).toBeVisible();

    // Check that example cards show description
    await expect(
      page.getByText("Minimal example - draws a single circle"),
    ).toBeVisible();

    // Check that difficulty badges are visible
    await expect(page.getByText("beginner").first()).toBeVisible();

    // Verify filter options are present
    await expect(
      page.getByRole("radio", { name: "All Examples" }),
    ).toBeChecked();
    await expect(page.getByRole("radio", { name: "Beginner" })).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Intermediate" }),
    ).toBeVisible();
    await expect(page.getByRole("radio", { name: "Advanced" })).toBeVisible();
  });
});
