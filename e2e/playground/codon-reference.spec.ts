// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Core Playground", () => {
  test("codon-reference-panel", async ({ page }) => {
    const referenceButton = page.getByRole("button", {
      name: "Show codon reference",
    });
    const searchBox = page.getByRole("searchbox", { name: "Search codons..." });
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Click 'Reference' button
    await referenceButton.click();

    // 3. Verify reference panel opens with header
    await expect(page.getByText("Codon Reference")).toBeVisible();

    // Verify all category buttons are visible (use exact to avoid TanStack Router match)
    await expect(
      page.getByRole("button", { name: "All", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Control", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Drawing", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Transform", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Stack", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Math", exact: true }),
    ).toBeVisible();

    // 4. Search for 'CIRCLE' in search box
    await searchBox.fill("CIRCLE");

    // Verify search filters codons correctly - only CIRCLE visible
    await expect(
      page.getByText("Draw circle with radius from stack"),
    ).toBeVisible();

    // 5. Clear search and click category filter 'Drawing'
    await searchBox.fill("");
    await page.getByRole("button", { name: "Drawing" }).click();

    // Verify Drawing category shows drawing-related codons (use exact match)
    await expect(page.getByText("CIRCLE", { exact: true })).toBeVisible();
    await expect(page.getByText("RECT", { exact: true })).toBeVisible();
    await expect(page.getByText("LINE", { exact: true })).toBeVisible();
    await expect(page.getByText("TRIANGLE", { exact: true })).toBeVisible();

    // 6. Click a codon button (e.g., 'GGA') to insert into editor
    const originalValue = await genomeEditor.inputValue();
    await page.getByRole("button", { name: "GGA" }).click();

    // Verify clicking codon inserts it into editor
    const newValue = await genomeEditor.inputValue();
    expect(newValue).toContain("GGA");
    expect(newValue).not.toBe(originalValue);
  });
});
