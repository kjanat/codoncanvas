// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Mutation Lab", () => {
  test("mutation-lab-page-loads", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/mutation
    await page.goto("/demos/mutation");

    // 2. Verify page heading 'Mutation Laboratory'
    await expect(
      page.getByRole("heading", { name: /mutation laboratory/i }),
    ).toBeVisible();

    // 3. Verify mutation type buttons are visible
    // Expected: Silent, Missense, Nonsense, Point, Insertion, Deletion, Frameshift
    // Use ^pattern to match aria-labels starting with the mutation type name
    await expect(page.getByRole("button", { name: /^Silent:/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Missense:/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Nonsense:/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^Point:/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Insertion:/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Deletion:/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Frameshift:/i }),
    ).toBeVisible();

    // 4. Verify original genome textarea is present
    await expect(page.getByLabel(/original genome/i)).toBeVisible();

    // 5. Verify Apply Mutation button exists
    await expect(
      page.getByRole("button", { name: /apply mutation/i }),
    ).toBeVisible();
  });
});
