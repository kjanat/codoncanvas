// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Accessibility - ARIA Labels", () => {
  test("key-elements-are-accessible", async ({ page }): Promise<void> => {
    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify buttons have aria-labels
    const runButton = page.getByRole("button", { name: "Run genome" });
    await expect(runButton).toBeVisible();
    await expect(runButton).toHaveAttribute("aria-label", /run/i);

    // 3. Verify form inputs have labels
    const editor = page.getByRole("textbox", { name: "Genome editor" });
    await expect(editor).toBeVisible();

    // 4. Verify canvas has accessible name
    const canvas = page.getByRole("img", { name: "Genome execution output" });
    await expect(canvas).toBeVisible();
  });

  test("interactive-elements-are-labeled", async ({ page }): Promise<void> => {
    await page.goto("/");

    // All buttons should have accessible names
    const buttons = page.getByRole("button");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute("aria-label");
      const text = (await button.textContent())?.trim();

      // Button should have either aria-label or non-empty visible text
      const accessibleName = name ?? text;
      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.length).toBeGreaterThan(0);
    }
  });
});
