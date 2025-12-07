// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";
import { DEFAULT_GENOME } from "../support/constants";

test.describe("Core Playground", () => {
  test("undo-redo-functionality", async ({ page, isMobile }): Promise<void> => {
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });
    const originalGenome = DEFAULT_GENOME;
    const modifiedGenome = "ATG GAA AAT GGA CCC TAA";

    // 1. Navigate to playground
    await page.goto("/");

    if (isMobile) {
      // On mobile, test via overflow menu
      const moreButton = page.getByRole("button", { name: "More actions" });

      // 2. Verify initial editor state matches baseline
      await expect(genomeEditor).toBeVisible();
      await expect(genomeEditor).toHaveValue(originalGenome);

      // 3. Verify initial Undo/Redo are disabled
      await moreButton.click();
      const undoButtonInitial = page.getByRole("button", { name: "Undo" });
      const redoButtonInitial = page.getByRole("button", { name: "Redo" });
      await expect(undoButtonInitial).toBeDisabled();
      await expect(redoButtonInitial).toBeDisabled();
      // Close menu before editing
      await page.keyboard.press("Escape");

      // 4. Type additional codons in editor
      await genomeEditor.fill(modifiedGenome);
      await expect(genomeEditor).toHaveValue(modifiedGenome);

      // 5. Open menu and click Undo
      await moreButton.click();
      const undoButton = page.getByRole("button", { name: "Undo" });
      await expect(undoButton).toBeEnabled();
      await undoButton.click();

      // Verify Undo restores previous editor state
      await expect(genomeEditor).toHaveValue(originalGenome);

      // 6. Open menu and click Redo
      await moreButton.click();
      const redoButton = page.getByRole("button", { name: "Redo" });
      await expect(redoButton).toBeEnabled();
      await redoButton.click();

      // Verify Redo restores the undone change
      await expect(genomeEditor).toHaveValue(modifiedGenome);
    } else {
      // Desktop: buttons are directly visible
      const undoButton = page.getByRole("button", { name: "Undo last change" });
      const redoButton = page.getByRole("button", { name: "Redo last change" });

      // 2. Verify Undo button is initially disabled
      await expect(undoButton).toBeDisabled();
      await expect(redoButton).toBeDisabled();

      // 3. Type additional codons in editor
      await genomeEditor.fill(modifiedGenome);

      // 4. Verify Undo button becomes enabled
      await expect(undoButton).toBeEnabled();

      // 5. Click Undo button
      await undoButton.click();

      // Verify Undo restores previous editor state
      await expect(genomeEditor).toHaveValue(originalGenome);

      // 6. Verify Redo button becomes enabled and Undo is disabled
      await expect(redoButton).toBeEnabled();
      await expect(undoButton).toBeDisabled();

      // 7. Click Redo button
      await redoButton.click();

      // Verify Redo restores the undone change
      await expect(genomeEditor).toHaveValue(modifiedGenome);

      // Verify button states update correctly
      await expect(undoButton).toBeEnabled();
      await expect(redoButton).toBeDisabled();
    }
  });
});
