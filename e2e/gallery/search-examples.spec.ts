// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Example Gallery", () => {
  test("search-examples", async ({ page }) => {
    const searchBox = page.getByRole("searchbox", {
      name: "Search examples...",
    });

    // 1. Navigate to /gallery
    await page.goto("/gallery");

    // 2. Type 'spiral' in search box
    await searchBox.fill("spiral");

    // 3. Verify filtered results contain spiral examples
    await expect(
      page.getByRole("heading", { name: "Fibonacci Spiral" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Loop Spiral" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Spiral Pattern" }),
    ).toBeVisible();

    // Verify non-spiral examples are not visible
    await expect(
      page.getByRole("heading", { name: "Hello Circle" }),
    ).not.toBeVisible();

    // 4. Clear search and verify all examples return
    await searchBox.fill("");

    // Verify all examples are visible again
    await expect(
      page.getByRole("heading", { name: "Hello Circle" }),
    ).toBeVisible();
    await expect(page.getByText("Browse 39 examples")).toBeVisible();
  });
});
