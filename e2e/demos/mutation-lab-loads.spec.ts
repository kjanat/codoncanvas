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
    await expect(page.getByRole("button", { name: /silent/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /missense/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /nonsense/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /point/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /insertion/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /deletion/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /frameshift/i }),
    ).toBeVisible();

    // 4. Verify original genome textarea is present
    await expect(page.getByLabel(/original genome/i)).toBeVisible();

    // 5. Verify Apply Mutation button exists
    await expect(
      page.getByRole("button", { name: /apply mutation/i }),
    ).toBeVisible();
  });
});
