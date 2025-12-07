// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Error Handling", () => {
  test("invalid-genome-syntax", async ({ page }): Promise<void> => {
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Enter genome with invalid codons
    await genomeEditor.fill("ATG XYZ TAA");

    // Validation feedback in alert panel
    const errorPanel = page.getByRole("alert");
    await expect(errorPanel).toBeVisible();
    await expect(errorPanel.getByText(/Invalid character/)).toBeVisible();

    // Run button disabled when genome is invalid
    await expect(
      page.getByRole("button", { name: "Run genome" }),
    ).toBeDisabled();
  });
});
