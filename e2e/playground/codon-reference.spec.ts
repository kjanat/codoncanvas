// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Core Playground", () => {
  test("codon-reference-panel", async ({ page }): Promise<void> => {
    const referenceButton = page.getByRole("button", {
      name: "Show codon reference",
    });
    const searchBox = page.getByRole("searchbox", { name: "Search codons" });
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Click 'Reference' button
    await referenceButton.click();

    // 3. Verify reference panel opens with header (role-based for semantic check)
    await expect(
      page.getByRole("heading", { name: "Codon Reference" }),
    ).toBeVisible();

    // Verify all category buttons are visible (aria-label is "Filter by X")
    const categories = [
      "All",
      "Control",
      "Drawing",
      "Transform",
      "Stack",
      "Math",
    ];
    for (const category of categories) {
      await expect(
        page.getByRole("button", { name: `Filter by ${category}` }),
      ).toBeVisible();
    }

    // 4. Search for 'CIRCLE' in search box
    await searchBox.fill("CIRCLE");

    // Verify search filters codons correctly - verifies expected CIRCLE codons are visible
    await expect(
      page.getByText("Draw circle with radius from stack"),
    ).toBeVisible();

    // Verify non-matching codons are hidden (negative assertion)
    await expect(page.getByText("RECT", { exact: true })).not.toBeVisible();
    await expect(page.getByText("PUSH", { exact: true })).not.toBeVisible();

    // 5. Clear search and click category filter 'Drawing'
    await searchBox.fill("");
    const drawingFilterButton = page.getByRole("button", {
      name: "Filter by Drawing",
    });
    await drawingFilterButton.click();

    // Verify the button's accessibility state reflects the active filter
    await expect(drawingFilterButton).toHaveAttribute("aria-pressed", "true");

    // Verify Drawing category shows drawing-related codons
    await expect(page.getByText("CIRCLE", { exact: true })).toBeVisible();
    await expect(page.getByText("RECT", { exact: true })).toBeVisible();
    await expect(page.getByText("LINE", { exact: true })).toBeVisible();
    await expect(page.getByText("TRIANGLE", { exact: true })).toBeVisible();

    // Verify control codons are hidden when Drawing filter is active (negative assertion)
    await expect(page.getByText("PUSH", { exact: true })).not.toBeVisible();
    await expect(page.getByText("IF_ZERO", { exact: true })).not.toBeVisible();

    // 6. Click a codon button (e.g., 'GGA') to insert into editor
    const originalValue = await genomeEditor.inputValue();
    await page.getByRole("button", { name: "GGA" }).click();

    // Verify clicking codon inserts it into editor
    const newValue = await genomeEditor.inputValue();
    expect(newValue).toContain("GGA");
    expect(newValue).not.toBe(originalValue);
  });
});
