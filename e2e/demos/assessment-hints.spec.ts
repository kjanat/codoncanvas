// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

import { startAssessmentChallenge } from "../test-utils";

test.describe("Assessment Demo - Hints", () => {
  test("show-hint-provides-guidance", async ({ page }): Promise<void> => {
    // Start an assessment challenge
    await startAssessmentChallenge(page, "Easy");

    // Click 'Show Hint' button
    const showHintButton = page.getByRole("button", { name: "Show Hint" });
    await expect(showHintButton).toBeVisible();
    await showHintButton.click();

    // Verify hint provides guidance (hint text appears)
    await expect(page.getByText(/Hint:/i)).toBeVisible();

    // Verify 'Hide Hint' button appears after showing hint
    await expect(page.getByRole("button", { name: "Hide Hint" })).toBeVisible();

    // Click 'Hide Hint' to toggle hint off
    await page.getByRole("button", { name: "Hide Hint" }).click();

    // Verify hint is hidden
    await expect(page.getByText(/Hint:/i)).not.toBeVisible();

    // Verify 'Show Hint' button reappears
    await expect(page.getByRole("button", { name: "Show Hint" })).toBeVisible();
  });
});
