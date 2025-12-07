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

    // 9. Verify population size slider exists and is accessible
    await expect(page.getByLabel(/Population Size:/i)).toBeVisible();

    // 10. Verify educational content section exists
    await expect(
      page.getByRole("heading", { name: /About Genetic Drift/i }),
    ).toBeVisible();

    // Helper to get current generation number
    const getGeneration = async (): Promise<number> => {
      const text = await page
        .getByRole("heading", { name: /Generation \d+/i })
        .textContent();
      return parseInt(text?.match(/\d+/)?.[0] ?? "0", 10);
    };

    // 11. Test Step button advances generation
    const initialGen = await getGeneration();
    expect(initialGen).toBe(0);

    await page.getByRole("button", { name: "Step" }).click();

    // Wait for generation to change and verify it increased
    await expect(
      page.getByRole("heading", { name: /Generation [1-9]\d*/i }),
    ).toBeVisible();
    const afterStepGen = await getGeneration();
    expect(afterStepGen).toBeGreaterThan(initialGen);

    // 12. Test Reset button resets simulation
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(
      page.getByRole("heading", { name: "Generation 0" }),
    ).toBeVisible();

    // 13. Test Run/Pause functionality
    await page.getByRole("button", { name: "Run" }).click();

    // Button should change to "Pause" when running
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

    // Wait for simulation to advance (generation > 0)
    await expect(
      page.getByRole("heading", { name: /Generation [1-9]\d*/i }),
    ).toBeVisible();

    // Pause the simulation
    await page.getByRole("button", { name: "Pause" }).click();

    // Button should change back to "Run"
    await expect(page.getByRole("button", { name: "Run" })).toBeVisible();
  });
});
