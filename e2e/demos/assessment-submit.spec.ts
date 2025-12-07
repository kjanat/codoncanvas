// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Assessment Demo - Submit Answer", () => {
  test("submit-answer-shows-feedback", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/assessment
    await page.goto("/demos/assessment");

    // 2. Start a challenge
    await page.getByRole("button", { name: "Easy" }).click();
    await page.getByRole("button", { name: "Start Challenge" }).click();

    // 3. Wait for challenge UI to appear
    await expect(
      page.getByText("What type of mutation occurred?"),
    ).toBeVisible();

    // 4. Verify Submit Answer button is initially disabled
    const submitButton = page.getByRole("button", { name: "Submit Answer" });
    await expect(submitButton).toBeDisabled();

    // 5. Click one of the mutation type answers (Silent for Easy difficulty)
    await page.getByRole("button", { name: /Silent/i }).click();

    // 6. Verify submit button becomes enabled after selection
    await expect(submitButton).toBeEnabled();

    // 7. Click 'Submit Answer' button
    await submitButton.click();

    // 8. Verify feedback shows (either correct or incorrect result)
    // ResultFeedback component shows either "Correct!" or "Incorrect" and a "Next Challenge" button
    const correctFeedback = page.getByText("Correct!", { exact: true });
    const incorrectFeedback = page.getByText("Incorrect", { exact: true });
    await expect(correctFeedback.or(incorrectFeedback)).toBeVisible();

    // 9. Verify next challenge button appears after submission
    await expect(
      page.getByRole("button", { name: "Next Challenge" }),
    ).toBeVisible();
  });
});
