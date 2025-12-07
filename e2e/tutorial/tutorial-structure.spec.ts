// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial System", () => {
  test("tutorial-page-structure", async ({ page }): Promise<void> => {
    // 1. Navigate to /tutorial
    await page.goto("/tutorial");

    // 2. Verify lesson sidebar with modules
    // Check for module headings (Module 1, 2, 3)
    await expect(
      page.getByRole("heading", { name: /Module 1: First Steps/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Module 2: Mutations/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Module 3: Advanced/i }),
    ).toBeVisible();

    // 3. Verify progress indicator shows initial state
    await expect(page.getByText("Overall Progress")).toBeVisible();
    await expect(page.getByText(/\d+\/\d+ lessons/)).toBeVisible();

    // 4. Verify first lesson content loads
    // Check for first lesson title
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Hello|Introduction|Getting Started/i,
      }),
    ).toBeVisible();

    // Check for key lesson components
    await expect(page.getByText("Instructions")).toBeVisible();
    await expect(page.getByText("Your Code")).toBeVisible();
    await expect(page.getByText("Preview")).toBeVisible();
  });
});
