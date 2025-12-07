// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Mutation Lab - Silent Mutation", () => {
  test("apply-silent-mutation", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/mutation with deterministic seed
    await page.goto("/demos/mutation?test-seed=42");

    // 2. Click 'Silent' mutation button
    await page.getByRole("button", { name: /^Silent:/i }).click();

    // 3. Click 'Apply Mutation' button
    await page.getByRole("button", { name: /apply mutation/i }).click();

    // 4. Verify silent mutation characteristics
    // Title confirms mutation type
    await expect(
      page.getByRole("heading", { name: "Mutation Result: silent" }),
    ).toBeVisible();

    // Verify exactly 1 codon changed (silent mutations affect single codon)
    // UI structure in DiffViewer header: <span>{count}</span><span>codon changed</span>
    // Scope to the DiffViewer container using the mutation result heading
    const diffViewerHeader = page
      .getByRole("heading", { name: "Mutation Result: silent" })
      .locator("..");
    const codonChangedLabel = diffViewerHeader.getByText("codon changed");
    await expect(codonChangedLabel).toBeVisible();
    const countText = await codonChangedLabel.locator("..").textContent();
    expect(countText).toContain("1");

    // Verify the codon change is displayed (nucleotide sequence changed)
    // UI structure: "Pos X:" <code>AAA</code> "->" <code>BBB</code>
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
    // Use role-based locators for better accessibility alignment
    const originalCanvas = page.getByRole("img", { name: "Original Output" });
    const mutatedCanvas = page.getByRole("img", { name: "Mutated Output" });
    await expect(originalCanvas).toBeVisible();
    await expect(mutatedCanvas).toBeVisible();

    // Wait for both canvases to finish rendering (data-rendered="true")
    await expect(originalCanvas).toHaveAttribute("data-rendered", "true");
    await expect(mutatedCanvas).toHaveAttribute("data-rendered", "true");

    // For a truly silent mutation, both canvases should render identically
    // (same opcode = same visual output). Compare canvas image data.
    const [originalData, mutatedData] = await Promise.all([
      originalCanvas.evaluate((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D context for original canvas");
        }
        return ctx
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.toString();
      }),
      mutatedCanvas.evaluate((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D context for mutated canvas");
        }
        return ctx
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.toString();
      }),
    ]);

    // Silent mutation: codon changed but output identical (same opcode)
    expect(originalData).toBe(mutatedData);
  });
});
