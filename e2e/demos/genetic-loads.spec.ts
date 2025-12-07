// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Genetic Algorithm Demo", () => {
  test("genetic-demo-loads", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/genetic
    await page.goto("/demos/genetic");

    // 2. Verify page heading
    await expect(
      page.getByRole("heading", { name: "Genetic Algorithm", exact: true }),
    ).toBeVisible();

    // 3. Verify Parameters heading
    await expect(
      page.getByRole("heading", { name: "Parameters" }),
    ).toBeVisible();

    // 4. Verify Population heading
    await expect(
      page.getByRole("heading", { name: "Population" }),
    ).toBeVisible();

    // 5. Verify fitness chart heading
    await expect(
      page.getByRole("heading", { name: "Fitness Over Time" }),
    ).toBeVisible();

    // 6. Verify fitness chart canvas
    await expect(
      page.getByRole("img", {
        name: /Fitness history chart/i,
      }),
    ).toBeVisible();

    // 7. Verify simulation controls (Evolve button for genetic demo)
    await expect(page.getByRole("button", { name: "Evolve" })).toBeVisible();

    // 8. Verify Step button
    await expect(page.getByRole("button", { name: "Step" })).toBeVisible();

    // 9. Verify Reset button
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();

    // 10. Verify Fitness Function label
    await expect(
      page.getByText("Fitness Function", { exact: true }),
    ).toBeVisible();

    // 11. Verify population grid has individual buttons
    await expect(
      page.getByRole("button", {
        name: /Select individual 1 with fitness \d+%/i,
      }),
    ).toBeVisible();
  });
});
