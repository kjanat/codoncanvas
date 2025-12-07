// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Evolution Demo", () => {
  test("evolution-demo-loads", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/evolution
    await page.goto("/demos/evolution");

    // 2. Verify page heading
    await expect(
      page.getByRole("heading", { name: "Evolution Lab" }),
    ).toBeVisible();

    // 3. Verify parent panel heading
    await expect(
      page.getByRole("heading", { name: "Current Parent" }),
    ).toBeVisible();

    // 4. Verify parent genome textarea
    const genomeInput = page.getByRole("textbox", {
      name: /Parent genome code/i,
    });
    await expect(genomeInput).toBeVisible();

    // 5. Verify parent visualization canvas
    await expect(
      page.getByRole("img", { name: /Current parent genome visualization/i }),
    ).toBeVisible();

    // 6. Verify Generate Offspring button
    await expect(
      page.getByRole("button", { name: "Generate Offspring" }),
    ).toBeVisible();
  });

  test("evolution-demo-generates-candidates", async ({
    page,
  }): Promise<void> => {
    await page.goto("/demos/evolution");

    // Click Generate Offspring button
    await page.getByRole("button", { name: "Generate Offspring" }).click();

    // Verify candidate selection heading appears
    await expect(
      page.getByRole("heading", { name: "Select the Fittest Candidate" }),
    ).toBeVisible();

    // Verify at least one candidate button exists
    await expect(
      page.getByRole("button", { name: /Select candidate 1/i }),
    ).toBeVisible();
  });
});
