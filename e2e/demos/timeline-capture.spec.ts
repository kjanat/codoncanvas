// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

/** Parse step indicator text "Step X of Y" into numbers. Throws on invalid input. */
function parseStep(text: string | null): { current: number; total: number } {
  if (!text) throw new Error("Step indicator text is null");
  const match = text.match(/step (\d+) of (\d+)/i);
  if (!match) throw new Error(`Failed to parse step text: "${text}"`);
  return {
    current: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
  };
}

test.describe("Timeline Capture", () => {
  test("run-and-capture-timeline", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/timeline
    await page.goto("/demos/timeline");

    // 2. Click 'Run & Capture Timeline' button
    const captureButton = page.getByRole("button", {
      name: /run.*capture|capture.*timeline/i,
    });
    await captureButton.click();

    // 3. Verify timeline controls appear
    // Wait for timeline to be captured
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible({
      timeout: 10000,
    });

    // 4. Verify VM state panel shows execution data, not just a title
    const vmStateHeading = page.getByRole("heading", { name: "VM State" });
    await expect(vmStateHeading).toBeVisible();

    // Get the panel containing the VM state (parent of heading)
    const vmStatePanel = vmStateHeading.locator("..");

    // Verify each field label exists with formatted values
    await expect(vmStatePanel.getByText("Position")).toBeVisible();
    await expect(
      vmStatePanel.getByText(/\(-?\d+\.?\d*, -?\d+\.?\d*\)/),
    ).toBeVisible();

    await expect(vmStatePanel.getByText("Rotation")).toBeVisible();
    await expect(vmStatePanel.getByText(/-?\d+\.?\d*deg/)).toBeVisible();

    await expect(vmStatePanel.getByText("Scale")).toBeVisible();
    await expect(vmStatePanel.getByText(/\d+\.?\d*x/)).toBeVisible();

    await expect(vmStatePanel.getByText("Color (HSL)")).toBeVisible();
    await expect(vmStatePanel.getByText(/\d+, \d+%, \d+%/)).toBeVisible();

    // Get current step from step indicator (e.g., "Step 1 of 5")
    const stepText = await page.getByText(/step \d+ of \d+/i).textContent();
    const { current: currentStep } = parseStep(stepText);

    // Instruction count should match the current step number
    const instructionsRow = vmStatePanel
      .getByText("Instructions")
      .locator("..");
    const instructionCount = await instructionsRow
      .getByText(/^\d+$/)
      .textContent();
    expect(Number.parseInt(instructionCount ?? "0", 10)).toBe(currentStep);

    await expect(vmStatePanel.getByText("Stack")).toBeVisible();
    // Stack shows either "(empty)" or "[values]"
    await expect(
      vmStatePanel.getByText(/\(empty\)|\[.*\]/).first(),
    ).toBeVisible();
  });

  test("timeline-step-count-increments", async ({ page }): Promise<void> => {
    await page.goto("/demos/timeline");

    const captureButton = page.getByRole("button", {
      name: /run.*capture|capture.*timeline/i,
    });
    await captureButton.click();

    // Wait for timeline to be ready and verify format
    const stepIndicator = page.getByText(/step \d+ of \d+/i);
    await expect(stepIndicator).toBeVisible({ timeout: 10000 });

    const initialStep = parseStep(await stepIndicator.textContent());
    expect(initialStep.current).toBeGreaterThanOrEqual(1);
    expect(initialStep.total).toBeGreaterThan(1);

    // Click Next to increment step (use precise aria-label match)
    const nextButton = page.getByRole("button", { name: /next\s*step/i });
    await nextButton.click();

    // Verify step incremented by 1
    const afterNext = parseStep(await stepIndicator.textContent());
    expect(afterNext.current).toBe(initialStep.current + 1);
    expect(afterNext.total).toBe(initialStep.total); // total unchanged
  });
});
