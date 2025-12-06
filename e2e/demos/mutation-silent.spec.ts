// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Mutation Lab - Silent Mutation", () => {
  test("apply-silent-mutation", async ({ page }) => {
    // 1. Navigate to /demos/mutation
    await page.goto("/demos/mutation");

    // 2. Click 'Silent' mutation button
    await page.getByRole("button", { name: /silent/i }).click();

    // 3. Click 'Apply Mutation' button
    await page.getByRole("button", { name: /apply mutation/i }).click();

    // 4. Compare original and mutated genomes
    // DiffViewer should show the result
    await expect(page.getByText(/mutation result/i)).toBeVisible();

    // Canvas panels should be visible for comparison
    const canvases = page.locator("canvas");
    await expect(canvases.first()).toBeVisible();
  });
});
