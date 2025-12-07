// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Mutation Lab - Silent Mutation", () => {
  test("apply-silent-mutation", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/mutation
    await page.goto("/demos/mutation");

    // 2. Click 'Silent' mutation button
    await page.getByRole("button", { name: /silent/i }).click();

    // 3. Click 'Apply Mutation' button
    await page.getByRole("button", { name: /apply mutation/i }).click();

    // 4. Compare original and mutated genomes
    // Verify DiffViewer title indicates a silent mutation
    await expect(
      page.getByRole("heading", { name: "Mutation Result: silent" }),
    ).toBeVisible();

    // Canvas panels should be visible for comparison
    const canvases = page.locator("canvas");
    await expect(canvases).toHaveCount(2);
    await expect(canvases.first()).toBeVisible();
    await expect(canvases.last()).toBeVisible();
  });
});
