// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Accessibility - ARIA Labels", () => {
  test("key-elements-have-aria-labels", async ({ page }): Promise<void> => {
    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify run button has aria-label
    const runButton = page.getByRole("button", { name: "Run genome" });
    await expect(runButton).toBeVisible();
    await expect(runButton).toHaveAttribute("aria-label", /run genome/i);

    // 3. Verify editor has aria-label
    const editor = page.getByRole("textbox", { name: "Genome editor" });
    await expect(editor).toBeVisible();
    await expect(editor).toHaveAttribute("aria-label", /genome editor/i);

    // 4. Verify canvas has aria-label
    const canvas = page.getByRole("img", { name: "Genome execution output" });
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute(
      "aria-label",
      /genome execution output/i,
    );
  });

  test("interactive-elements-are-labeled", async ({ page }): Promise<void> => {
    await page.goto("/");

    // Generic labels that provide no meaningful accessibility context
    const GENERIC_LABELS = ["button", "click", "submit", "link", "icon", "btn"];

    // All buttons should have accessible names
    const buttons = page.getByRole("button");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);

      // Normalize both sources up front (treat missing as empty string)
      const ariaLabel = (
        (await button.getAttribute("aria-label")) ?? ""
      ).trim();
      const textContent = ((await button.textContent()) ?? "").trim();

      // Derive accessible name: prefer aria-label, fall back to text content
      const accessibleName = ariaLabel || textContent;

      // Must have a non-empty accessible name
      expect(
        accessibleName.length > 0,
        `Button ${i} has no accessible name (aria-label or text content)`,
      ).toBe(true);

      // Accessible name must not be a generic value
      const isGeneric = GENERIC_LABELS.some(
        (generic) => accessibleName.toLowerCase() === generic,
      );
      expect(
        isGeneric,
        `Button ${i} has generic accessible name "${accessibleName}"`,
      ).toBe(false);
    }
  });
});
