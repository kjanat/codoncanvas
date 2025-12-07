// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

import { startAssessmentChallenge } from "../test-utils";

test.describe("Assessment Demo - Submit Answer", () => {
  test("submit-answer-shows-feedback", async ({ page }): Promise<void> => {
    // Start a challenge
    await startAssessmentChallenge(page, "Easy");

    // Verify Submit Answer button is initially disabled
    const submitButton = page.getByRole("button", { name: "Submit Answer" });
    await expect(submitButton).toBeDisabled();

    // Click one of the mutation type answers (Silent for Easy difficulty)
    await page.getByRole("button", { name: /Silent/i }).click();

    // Verify submit button becomes enabled after selection
    await expect(submitButton).toBeEnabled();

    // Click 'Submit Answer' button
    await submitButton.click();

    // Verify feedback shows (either correct or incorrect result)
    // ResultFeedback component shows either "Correct!" or "Incorrect" and a "Next Challenge" button
    const correctFeedback = page.getByText("Correct!", { exact: true });
    const incorrectFeedback = page.getByText("Incorrect", { exact: true });
    await expect(correctFeedback.or(incorrectFeedback)).toBeVisible();

    // Verify next challenge button appears after submission
    await expect(
      page.getByRole("button", { name: "Next Challenge" }),
    ).toBeVisible();
  });
});
