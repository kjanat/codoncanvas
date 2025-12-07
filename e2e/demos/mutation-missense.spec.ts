// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Mutation Lab - Missense Mutation", () => {
  test("apply-missense-mutation", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/mutation
    await page.goto("/demos/mutation");

    // 2. Click 'Missense' mutation button
    await page.getByRole("button", { name: /missense/i }).click();

    // 3. Click 'Apply Mutation'
    await page.getByRole("button", { name: /apply mutation/i }).click();

    // 4. Compare visual outputs
    // Mutation changes codon function, visual output should differ
    await expect(page.getByText(/mutation result/i)).toBeVisible();

    // Verify exactly 2 canvases render in the diff container (original + mutated)
    const diffContainer = page.locator('[data-testid="diff-canvas-container"]');
    const canvases = diffContainer.locator("canvas");
    await expect(canvases).toHaveCount(2);
  });
});
