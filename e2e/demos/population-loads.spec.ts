// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Population Demo", () => {
  test("population-demo-loads", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/population
    await page.goto("/demos/population");

    // 2. Verify page heading
    await expect(
      page.getByRole("heading", { name: "Population Genetics" }),
    ).toBeVisible();

    // 3. Verify Parameters heading
    await expect(
      page.getByRole("heading", { name: "Parameters" }),
    ).toBeVisible();

    // 4. Verify allele frequency chart heading
    await expect(
      page.getByRole("heading", { name: "Allele Frequency Over Time" }),
    ).toBeVisible();

    // 5. Verify allele frequency chart canvas
    await expect(
      page.getByRole("img", {
        name: /Allele frequency chart over generations/i,
      }),
    ).toBeVisible();

    // 6. Verify simulation controls (Run button)
    await expect(page.getByRole("button", { name: "Run" })).toBeVisible();

    // 7. Verify Step button
    await expect(page.getByRole("button", { name: "Step" })).toBeVisible();

    // 8. Verify Reset button
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();

    // 9. Verify population size slider label
    await expect(page.getByText(/Population Size:/i)).toBeVisible();

    // 10. Verify educational content section exists
    await expect(
      page.getByRole("heading", { name: /About Genetic Drift/i }),
    ).toBeVisible();
  });
});
