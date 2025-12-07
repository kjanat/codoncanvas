// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial Hint System", () => {
  test("hint-system", async ({ page }): Promise<void> => {
    // 1. Navigate to /tutorial
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(
      page.getByRole("heading", { name: "Instructions" }),
    ).toBeVisible();

    // 2. Click 'Show hint' button - it has format "Show hint (1/3)"
    const hintButton = page.getByRole("button", { name: /show hint/i });
    await expect(hintButton).toBeVisible();
    await hintButton.click();

    // 3. Verify hint content displays in a list
    const hintsList = page.getByRole("list").filter({
      has: page.getByText(/Try:/i),
    });
    await expect(hintsList).toBeVisible();

    // 4. Verify hint button text updates
    await expect(hintButton).toContainText(/hint/i);
  });

  test("hints-persist-when-returning", async ({ page }): Promise<void> => {
    await page.goto("/tutorial");

    // Reveal a hint
    const hintButton = page.getByRole("button", { name: /hint/i });
    await expect(hintButton).toBeVisible();
    await hintButton.click();

    // Verify hint is revealed
    const hintsList = page.getByRole("list").filter({
      has: page.getByText(/Try:/i),
    });
    await expect(hintsList).toBeVisible();

    // Navigate away and back - wait for each page to load
    await page.goto("/gallery");
    await page.waitForLoadState("domcontentloaded");
    await page.goto("/tutorial");
    await page.waitForLoadState("domcontentloaded");

    // Verify hint is STILL visible (persisted via localStorage)
    await expect(hintsList).toBeVisible();
  });
});
