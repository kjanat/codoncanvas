// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("File Operations", () => {
  test("load-example-from-dropdown", async ({ page }) => {
    const exampleSelector = page.getByLabel("Select example genome");
    const genomeEditor = page.getByRole("textbox", { name: "Genome editor" });

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Open example selector dropdown and select 'Hello Circle'
    await exampleSelector.selectOption(["Hello Circle"]);

    // 3. Verify URL updates to include ?example=helloCircle
    await expect(page).toHaveURL(/\?example=helloCircle/);

    // 4. Verify genome code loads in editor
    await expect(genomeEditor).toHaveValue("ATG GAA AAT GGA TAA");

    // 5. Verify example info panel appears
    // Check title
    await expect(
      page.getByRole("heading", { name: "Hello Circle" }),
    ).toBeVisible();

    // Check description
    await expect(
      page.getByText("Minimal example - draws a single circle"),
    ).toBeVisible();

    // Check difficulty tag
    await expect(page.getByText("beginner")).toBeVisible();

    // Check concepts tag
    await expect(page.getByText("drawing")).toBeVisible();
  });
});
