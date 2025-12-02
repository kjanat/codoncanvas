// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Core Playground", () => {
  test("clear-canvas", async ({ page }) => {
    // 1. Navigate to playground
    await page.goto("/");

    // 2. Run the default genome to render something on canvas
    await page.getByRole("button", { name: "Run genome" }).click();

    // Verify canvas is visible after running
    const canvas = page.getByRole("img", { name: "Genome execution output" });
    await expect(canvas).toBeVisible();

    // 3. Click 'Clear' button in output section
    await page.getByRole("button", { name: "Clear canvas" }).click();

    // Canvas element should still be visible (just cleared/reset)
    await expect(canvas).toBeVisible();
  });
});
