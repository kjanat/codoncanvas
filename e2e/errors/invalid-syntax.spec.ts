// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Error Handling", () => {
  test("invalid-genome-syntax", async ({ page }) => {
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Enter genome with invalid codons
    await genomeEditor.fill("ATG XYZ TAA");

    // 3. Observe validation feedback
    await expect(page.getByRole("alert")).toBeVisible();

    // Verify error message indicates invalid codon
    await expect(page.getByText(/Invalid character/)).toBeVisible();

    // Verify Run button may be disabled
    await expect(
      page.getByRole("button", { name: "Run genome" }),
    ).toBeDisabled();

    // Verify error count is shown
    await expect(page.getByText(/error/i)).toBeVisible();
  });
});
