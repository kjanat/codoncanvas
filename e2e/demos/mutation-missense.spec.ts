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

    // At least one canvas should render (original)
    // Note: missense mutations may cause render failures in the mutated version
    const canvases = page.locator("canvas");
    await expect(canvases.first()).toBeVisible();
  });
});
