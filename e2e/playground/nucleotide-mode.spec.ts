// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Core Playground", () => {
  test("nucleotide-mode-toggle", async ({ page }) => {
    const toggleButton = page.getByRole("button", {
      name: "Toggle RNA display mode",
    });
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify initial mode shows 'DNA'
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toContainText("DNA");

    // Verify editor shows DNA format (T bases)
    await expect(genomeEditor).toHaveValue("ATG GAA AAT GGA TAA");

    // 3. Click RNA/DNA toggle button
    await toggleButton.click();

    // 4. Verify mode changes to 'RNA'
    await expect(toggleButton).toContainText("RNA");

    // Verify genome text shows RNA format with U instead of T
    await expect(genomeEditor).toHaveValue("AUG GAA AAU GGA UAA");

    // 5. Verify tooltip shows mode-specific information
    await expect(page.getByText("RNA Mode")).toBeVisible();
    await expect(
      page.getByText("RNA uses Uracil (U) instead of Thymine"),
    ).toBeVisible();

    // Toggle back to DNA mode
    await toggleButton.click();

    // Verify mode switches back to DNA
    await expect(toggleButton).toContainText("DNA");
    await expect(genomeEditor).toHaveValue("ATG GAA AAT GGA TAA");
  });
});
