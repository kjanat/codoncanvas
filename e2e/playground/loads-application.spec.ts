// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";
import { DEFAULT_GENOME } from "../support/constants";

test.describe("Core Playground", () => {
  test("loads-application-with-default-state", async ({
    page,
  }): Promise<void> => {
    // 1. Navigate to homepage
    await page.goto("/");

    // 2. Verify page title contains 'CodonCanvas'
    await expect(page).toHaveTitle(/CodonCanvas/);

    // 3. Verify editor textbox is visible with placeholder text
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });
    await expect(genomeEditor).toBeVisible();

    // 4. Verify 'Run' button is present
    await expect(
      page.getByRole("button", { name: "Run genome" }),
    ).toBeVisible();

    // 5. Verify 'Output' canvas section is present
    await expect(page.getByText("Output")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Genome execution output" }),
    ).toBeVisible();

    // 6. Verify navigation links (Playground, Gallery, Tutorial, Demos) are present
    await expect(page.getByRole("link", { name: "Playground" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Gallery" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tutorial" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Demos" })).toBeVisible();

    // Expected Results: Verify default state
    // Editor contains default genome
    await expect(genomeEditor).toHaveValue(DEFAULT_GENOME);

    // Validation indicator shows 'Valid'
    await expect(page.getByText("Valid")).toBeVisible();

    // Codon count shows '5 codons, 4 instructions'
    await expect(page.getByText("5 codons, 4 instructions")).toBeVisible();
  });
});
