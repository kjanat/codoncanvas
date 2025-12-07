// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Mutation Lab - Frameshift Mutation", () => {
  test("apply-frameshift-mutation", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/mutation
    await page.goto("/demos/mutation");

    // 2. Click 'Frameshift' mutation button
    await page.getByRole("button", { name: /frameshift/i }).click();

    // 3. Click 'Apply Mutation'
    await page.getByRole("button", { name: /apply mutation/i }).click();

    // 4. Observe downstream changes
    // Frameshift affects reading frame, multiple downstream codons change
    await expect(page.getByText(/mutation result/i)).toBeVisible();

    // Visual output should be significantly different
    const canvases = page.locator("canvas");
    await expect(canvases.first()).toBeVisible();
  });

  test("custom-genome-mutation", async ({ page }): Promise<void> => {
    await page.goto("/demos/mutation");

    // Enter custom genome
    const genomeInput = page.getByLabel(/original genome/i);
    await genomeInput.clear();
    await genomeInput.fill("ATG GAA CCC GGA TAA");

    // Apply any mutation
    await page.getByRole("button", { name: /point/i }).click();
    await page.getByRole("button", { name: /apply mutation/i }).click();

    // Should show result
    await expect(page.getByText(/mutation result/i)).toBeVisible();
  });
});
