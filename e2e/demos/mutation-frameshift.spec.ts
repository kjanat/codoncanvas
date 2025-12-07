// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Mutation Lab - Frameshift Mutation", () => {
  test("apply-frameshift-mutation", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/mutation
    await page.goto("/demos/mutation");

    // 2. Click 'Frameshift' mutation button
    await page.getByRole("button", { name: /^Frameshift:/i }).click();

    // 3. Click 'Apply Mutation' button
    await page.getByRole("button", { name: /apply mutation/i }).click();

    // 4. Observe downstream changes
    // Frameshift affects reading frame, multiple downstream codons change
    await expect(
      page.getByRole("heading", { name: "Mutation Result: frameshift" }),
    ).toBeVisible();

    // Visual output should be significantly different
    const originalCanvas = page.getByRole("img", { name: "Original Output" });
    const mutatedCanvas = page.getByRole("img", { name: "Mutated Output" });
    const mutatedError = page.getByRole("alert", {
      name: "Mutated Output - render failed",
    });
    await expect(originalCanvas).toBeVisible();
    await expect(mutatedCanvas.or(mutatedError)).toBeVisible();

    // Verify that multiple codons have changed due to frameshift
    const diffContainer = page
      .locator("div")
      .filter({ hasText: /codons? changed/i })
      .first();
    await expect(diffContainer).toBeVisible();
    const countText = await diffContainer.textContent();
    const count = Number.parseInt(countText?.match(/(\d+)/)?.[0] || "0", 10);
    expect(count).toBeGreaterThan(1);
  });

  test("custom-genome-mutation", async ({ page }): Promise<void> => {
    await page.goto("/demos/mutation");

    // Enter custom genome with specific codons
    const customGenome = "ATG GAA CCC GGA TAA";
    const genomeInput = page.getByLabel(/original genome/i);
    await genomeInput.clear();
    await genomeInput.fill(customGenome);

    // Apply point mutation
    await page.getByRole("button", { name: /^Point:/i }).click();
    await page.getByRole("button", { name: /apply mutation/i }).click();

    // Verify mutation result appears
    await expect(page.getByText(/mutation result/i)).toBeVisible();

    // Verify custom genome was actually used - check Original panel in DiffViewer shows our codons
    // The Original panel has a header div with text "Original" followed by codon list
    const originalPanelHeader = page
      .locator("div")
      .filter({ hasText: /^Original$/ })
      .first();
    const originalPanel = originalPanelHeader.locator("..");

    // Derive codons from customGenome and assert each appears in the Original panel
    const codons = customGenome.split(/\s+/).filter((c) => c.trim().length > 0);
    for (const codon of codons) {
      await expect(
        originalPanel.locator("span").filter({ hasText: codon }).first(),
        `Original panel should contain codon "${codon}" from custom genome`,
      ).toBeVisible();
    }

    // At least one codon from our custom genome should appear in the changes
    const changesSection = page.getByRole("heading", {
      name: "Changes at codon level:",
    });
    await expect(changesSection).toBeVisible();

    // Verify the changed codon is from our custom genome
    const changeItem = changesSection.locator("..").locator("li").first();
    const changeText = await changeItem.textContent();
    expect(changeText).toBeTruthy();
    // Changed codon should be one of our custom genome codons
    const hasCustomCodon = codons.some((codon) => changeText?.includes(codon));
    expect(hasCustomCodon).toBe(true);
  });
});
