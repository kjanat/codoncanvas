// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Achievements Demo", () => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await page.goto("/demos/achievements");
  });

  test("achievements-page-loads", async ({ page }): Promise<void> => {
    // Verify page heading
    await expect(
      page.getByRole("heading", { name: "Achievements" }),
    ).toBeVisible();

    // 3. Verify subtitle is present
    await expect(
      page.getByText("Track your progress and earn badges"),
    ).toBeVisible();
  });

  test("achievements-grid-displayed", async ({ page }): Promise<void> => {
    // Verify achievements grid/cards section exists (lg:col-span-3 card)
    // The grid contains filter toggle (radiogroup) and achievement cards
    await expect(page.getByRole("radiogroup")).toBeVisible();
    await expect(page.getByRole("radio", { name: "All" })).toBeVisible();
  });

  test("progress-bar-visible", async ({ page }): Promise<void> => {
    // Verify progress bar with "Overall Progress" label
    await expect(page.getByText("Overall Progress")).toBeVisible();

    // Verify achievements counter format (X / Y achievements)
    await expect(page.getByText(/\d+ \/ \d+ achievements/)).toBeVisible();
  });

  test("stats-panel-visible", async ({ page }): Promise<void> => {
    // Verify "Your Stats" heading
    await expect(
      page.getByRole("heading", { name: "Your Stats" }),
    ).toBeVisible();

    // Verify stat cards are present
    await expect(page.getByText("Genomes Executed")).toBeVisible();
    await expect(page.getByText("Shapes Drawn")).toBeVisible();
  });

  test("simulation-panel-visible", async ({ page }): Promise<void> => {
    // Verify "Simulate Actions" heading
    await expect(
      page.getByRole("heading", { name: "Simulate Actions" }),
    ).toBeVisible();

    // Verify simulation buttons exist
    await expect(
      page.getByRole("button", { name: "Execute Genome" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Draw Shape" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reset All Progress" }),
    ).toBeVisible();
  });
});
