// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Assessment Demo - Page Load", () => {
  test("assessment-page-loads-with-expected-elements", async ({
    page,
  }): Promise<void> => {
    // 1. Navigate to /demos/assessment
    await page.goto("/demos/assessment");

    // 2. Verify heading 'Assessment Mode'
    await expect(
      page.getByRole("heading", { name: "Assessment Mode" }),
    ).toBeVisible();

    // 3. Verify difficulty buttons (Easy, Medium, Hard)
    await expect(page.getByRole("button", { name: "Easy" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Medium" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hard" })).toBeVisible();

    // 4. Verify mutation types reference section heading
    await expect(
      page.getByRole("heading", { name: "Mutation Types Reference" }),
    ).toBeVisible();

    // 5. Verify 'Start Challenge' button visible
    await expect(
      page.getByRole("button", { name: "Start Challenge" }),
    ).toBeVisible();

    // 6. Verify reference shows 7 mutation types as headings
    // Silent, Missense, Nonsense, Point, Insertion, Deletion, Frameshift
    await expect(
      page.getByRole("heading", { name: "Silent", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Missense", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Nonsense", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Point", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Insertion", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Deletion", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Frameshift", exact: true }),
    ).toBeVisible();
  });
});
