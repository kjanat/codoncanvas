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

    // 4. Verify parent genome textarea is editable and has content
    const genomeInput = page.getByRole("textbox", {
      name: /Parent genome code/i,
    });
    await expect(genomeInput).toBeVisible();
    await expect(genomeInput).toBeEditable();
    await expect(genomeInput).not.toBeEmpty();

    // 5. Verify parent visualization canvas actually renders
    const canvas = page.getByRole("img", {
      name: /Current parent genome visualization/i,
    });
    await expect(canvas).toBeVisible();
    // Verify canvas has actual dimensions (not collapsed)
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);

    // 6. Verify Generate Offspring button is enabled
    const generateButton = page.getByRole("button", {
      name: "Generate Offspring",
    });
    await expect(generateButton).toBeVisible();
    await expect(generateButton).toBeEnabled();
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

    // Verify multiple candidates are generated
    const candidateButtons = page.getByRole("button", {
      name: /Select candidate \d+:/i,
    });
    const candidateCount = await candidateButtons.count();
    expect(candidateCount).toBeGreaterThan(1);

    // Verify each candidate has an associated visualization
    for (let i = 1; i <= candidateCount; i++) {
      await expect(
        page.getByRole("img", {
          name: new RegExp(`Genome visualization for candidate ${i}`, "i"),
        }),
      ).toBeVisible();
    }
  });
});
