// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Example Gallery", () => {
  test("gallery-page-loads", async ({ page }): Promise<void> => {
    // 1. Navigate to /gallery
    await page.goto("/gallery");

    // 2. Verify page heading 'Example Gallery'
    await expect(
      page.getByRole("heading", { name: "Example Gallery" }),
    ).toBeVisible();

    // 3. Verify example count displays (any positive number)
    await expect(page.getByText(/Browse\s+\d+\s+examples?/i)).toBeVisible();

    // 4. Verify example cards are visible and have structure
    const firstCard = page
      .locator("main")
      .getByRole("button")
      .filter({ has: page.locator("h3") })
      .first();
    await expect(firstCard.getByRole("heading")).toBeVisible();
    await expect(firstCard.locator("p, [class*='description']")).toBeVisible();

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
