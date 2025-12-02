// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Core Playground", () => {
  test("editor-typing-and-validation", async ({ page }) => {
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Clear the editor textbox and type invalid genome
    await genomeEditor.click();
    await genomeEditor.fill("ATG XXX TAA");

    // 3. Verify validation shows error for invalid codon
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText("Invalid character 'X'")).toBeVisible();

    // 4. Verify Run button is disabled when genome is invalid
    await expect(
      page.getByRole("button", { name: "Run genome" }),
    ).toBeDisabled();

    // 5. Clear editor and type valid genome
    await genomeEditor.fill("ATG GAA CCC GGA TAA");

    // 6. Verify validation shows valid status (wait for validation to complete)
    // The validation indicator shows "Valid" with a checkmark
    await expect(page.getByText("Valid", { exact: true })).toBeVisible();

    // 7. Verify codon count updates correctly
    await expect(page.getByText("5 codons, 4 instructions")).toBeVisible();

    // 8. Verify Run button is now enabled
    await expect(
      page.getByRole("button", { name: "Run genome" }),
    ).toBeEnabled();
  });
});
