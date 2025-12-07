// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Assessment Demo - Start Challenge", () => {
  test("start-challenge-displays-challenge-ui", async ({
    page,
  }): Promise<void> => {
    // 1. Navigate to /demos/assessment
    await page.goto("/demos/assessment");

    // 2. Select 'Easy' difficulty (default, but click to ensure)
    await page.getByRole("button", { name: "Easy" }).click();

    // 3. Click 'Start Challenge' button
    await page.getByRole("button", { name: "Start Challenge" }).click();

    // 4. Verify challenge UI appears - Original and Mutated genome panels
    await expect(
      page.getByRole("img", { name: "Original genome visualization" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Mutated genome visualization" }),
    ).toBeVisible();

    // 5. Verify question 'What type of mutation occurred?' appears
    await expect(
      page.getByText("What type of mutation occurred?"),
    ).toBeVisible();

    // 6. Verify answer options are visible (at least Silent and Missense for Easy)
    await expect(page.getByRole("button", { name: /Silent/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Missense/i })).toBeVisible();

    // 7. Verify Submit Answer button exists (initially disabled)
    const submitButton = page.getByRole("button", { name: "Submit Answer" });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });
});
