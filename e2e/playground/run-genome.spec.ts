// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Core Playground", () => {
  test("run-genome-renders-canvas", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Navigate to playground
    await page.goto("/");

    // 2. Ensure default genome is loaded
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toHaveValue("ATG GAA AAT GGA TAA");

    // 3. Click 'Run' button to execute genome
    await page.getByRole("button", { name: "Run genome" }).click();

    // 4. Verify canvas output is visible after run
    const canvas = page.getByRole("img", { name: "Genome execution output" });
    await expect(canvas).toBeVisible();

    // 5. Verify no console errors during execution
    expect(consoleErrors).toHaveLength(0);
  });
});
