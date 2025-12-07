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
      const ariaLabel = (await button.getAttribute("aria-label"))?.trim() || "";
      const textContent = (await button.textContent())?.trim() || "";

      // At least one must be a non-empty trimmed string
      const hasAriaLabel = ariaLabel.length > 0;
      const hasTextContent = textContent.length > 0;

      expect(
        hasAriaLabel || hasTextContent,
        `Button ${i} has no accessible name (aria-label or text content)`,
      ).toBe(true);

      // If aria-label is present, it must not be a generic value
      if (hasAriaLabel) {
        const isGeneric = GENERIC_LABELS.some(
          (generic) => ariaLabel.toLowerCase() === generic,
        );
        expect(
          isGeneric,
          `Button ${i} has generic aria-label "${ariaLabel}"`,
        ).toBe(false);
      }

      // If relying on text content (no aria-label), it must not be generic
      if (!hasAriaLabel && hasTextContent) {
        const isGeneric = GENERIC_LABELS.some(
          (generic) => textContent.toLowerCase() === generic,
        );
        expect(
          isGeneric,
          `Button ${i} has generic text content "${textContent}"`,
        ).toBe(false);
      }
    }
  });
});
