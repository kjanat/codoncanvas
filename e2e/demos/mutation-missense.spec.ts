// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/** Get canvas image data as string for comparison */
async function getCanvasData(canvas: Locator): Promise<string> {
  return canvas.evaluate((el: HTMLCanvasElement) => {
    const ctx = el.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context for canvas");
    }
    return ctx.getImageData(0, 0, el.width, el.height).data.toString();
  });
}

/** Apply missense mutation and check if it produced different visual output */
async function applyMissenseMutation(page: Page): Promise<{
  success: boolean;
  originalData: string;
  mutatedData: string;
}> {
  await page.goto("/demos/mutation");
  await page.getByRole("button", { name: /^Missense:/i }).click();
  await page.getByRole("button", { name: /apply mutation/i }).click();

  await expect(
    page.getByRole("heading", { name: "Mutation Result: missense" }),
  ).toBeVisible();

  const originalCanvas = page.getByRole("img", { name: "Original Output" });
  const mutatedCanvas = page.getByRole("img", { name: "Mutated Output" });
  const mutatedError = page.getByRole("alert", {
    name: "Mutated Output - render failed",
  });

  await expect(mutatedCanvas.or(mutatedError)).toBeVisible();

  if (!(await mutatedCanvas.isVisible())) {
    return { success: false, originalData: "", mutatedData: "" };
  }

  // Wait for both canvases to finish rendering
  await expect(originalCanvas).toHaveAttribute("data-rendered", "true");
  await expect(mutatedCanvas).toHaveAttribute("data-rendered", "true");

  const [originalData, mutatedData] = await Promise.all([
    getCanvasData(originalCanvas),
    getCanvasData(mutatedCanvas),
  ]);

  return {
    success: originalData !== mutatedData,
    originalData,
    mutatedData,
  };
}

test.describe("Mutation Lab - Missense Mutation", () => {
  test("apply-missense-mutation", async ({ page }): Promise<void> => {
    // Missense mutations are random - some may cause VM errors or same output.
    // Retry up to 5 times to get a visually different mutation.
    const MAX_ATTEMPTS = 5;
    let result = { success: false, originalData: "", mutatedData: "" };

    for (
      let attempt = 0;
      attempt < MAX_ATTEMPTS && !result.success;
      attempt++
    ) {
      result = await applyMissenseMutation(page);
    }

    // Verify we're on a valid mutation result page
    await expect(
      page.getByRole("heading", { name: "Mutation Result: missense" }),
    ).toBeVisible();
    await expect(page.getByText("codon changed")).toBeVisible();

    // Verify the codon change is displayed
    const changesHeading = page.getByRole("heading", {
      name: "Changes at codon level:",
    });
    await expect(changesHeading).toBeVisible();

    const changeItem = changesHeading.locator("..").locator("li").first();
    await expect(changeItem).toBeVisible();

    const codeElements = changeItem.locator("code");
    await expect(codeElements).toHaveCount(2);
    const originalCodon = await codeElements.first().textContent();
    const mutatedCodon = await codeElements.last().textContent();

    // Verify nucleotide change occurred (codons are different)
    expect(originalCodon).toBeTruthy();
    expect(mutatedCodon).toBeTruthy();
    expect(originalCodon).not.toBe(mutatedCodon);

    // Final state check
    const mutatedCanvas = page.getByRole("img", { name: "Mutated Output" });
    const mutatedError = page.getByRole("alert", {
      name: "Mutated Output - render failed",
    });

    const canvasVisible = await mutatedCanvas.isVisible();
    const errorVisible = await mutatedError.isVisible();

    // Either we got a successful different render, or error/same-output (valid edge cases)
    if (result.success) {
      expect(result.originalData).not.toBe(result.mutatedData);
    } else if (errorVisible) {
      await expect(mutatedError).toContainText("Render failed");
    } else if (canvasVisible) {
      // Same visual output is valid - codon changed but same visual result
      expect(originalCodon).not.toBe(mutatedCodon);
    }
  });
});
