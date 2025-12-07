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

    // 4. Verify missense mutation characteristics
    // Title confirms mutation type
    await expect(
      page.getByRole("heading", { name: "Mutation Result: missense" }),
    ).toBeVisible();

    // Verify codon changed count is displayed
    await expect(page.getByText("codon changed")).toBeVisible();

    // Verify the codon change is displayed (nucleotide sequence changed)
    const changesHeading = page.getByRole("heading", {
      name: "Changes at codon level:",
    });
    await expect(changesHeading).toBeVisible();

    // Get the change list item
    const changeItem = changesHeading.locator("..").locator("li").first();
    await expect(changeItem).toBeVisible();

    // Extract codons from <code> elements within the list item
    const codeElements = changeItem.locator("code");
    await expect(codeElements).toHaveCount(2);
    const originalCodon = await codeElements.first().textContent();
    const mutatedCodon = await codeElements.last().textContent();

    // Verify nucleotide change occurred (codons are different)
    expect(originalCodon).toBeTruthy();
    expect(mutatedCodon).toBeTruthy();
    expect(originalCodon).not.toBe(mutatedCodon);

    // Canvas panels show visual output for comparison
    const diffContainer = page.locator('[data-testid="diff-canvas-container"]');
    const canvases = diffContainer.locator("canvas");
    await expect(canvases).toHaveCount(2);
    await expect(canvases.first()).toBeVisible();
    await expect(canvases.last()).toBeVisible();

    // For missense mutation, visual output should differ (different opcode)
    const [originalData, mutatedData] = await Promise.all([
      canvases.first().evaluate((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D context for original canvas");
        }
        return ctx
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.toString();
      }),
      canvases.last().evaluate((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D context for mutated canvas");
        }
        return ctx
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.toString();
      }),
    ]);

    // Missense mutation: codon changed AND output differs (different opcode)
    expect(originalData).not.toBe(mutatedData);
  });
});
