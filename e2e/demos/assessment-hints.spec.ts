// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Assessment Demo - Hints", () => {
  test("show-hint-provides-guidance", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/assessment
    await page.goto("/demos/assessment");

    // 2. Start an assessment challenge
    await page.getByRole("button", { name: "Easy" }).click();
    await page.getByRole("button", { name: "Start Challenge" }).click();

    // 3. Wait for challenge UI to appear
    await expect(
      page.getByText("What type of mutation occurred?"),
    ).toBeVisible();

    // 4. Click 'Show Hint' button
    const showHintButton = page.getByRole("button", { name: "Show Hint" });
    await expect(showHintButton).toBeVisible();
    await showHintButton.click();

    // 5. Verify hint provides guidance (hint text appears)
    await expect(page.getByText(/Hint:/i)).toBeVisible();

    // 6. Verify 'Hide Hint' button appears after showing hint
    await expect(page.getByRole("button", { name: "Hide Hint" })).toBeVisible();

    // 7. Click 'Hide Hint' to toggle hint off
    await page.getByRole("button", { name: "Hide Hint" }).click();

    // 8. Verify hint is hidden
    await expect(page.getByText(/Hint:/i)).not.toBeVisible();

    // 9. Verify 'Show Hint' button reappears
    await expect(page.getByRole("button", { name: "Show Hint" })).toBeVisible();
  });
});
