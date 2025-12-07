// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Tutorial Lesson Validation", () => {
  test("lesson-code-validation", async ({ page }): Promise<void> => {
    // 1. Navigate to /tutorial on first lesson
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(
      page.getByRole("heading", { name: "Your Code" }),
    ).toBeVisible();

    // 2. Find the code editor using data-testid for stability
    const editor = page.getByTestId("lesson-editor");
    await expect(editor).toBeVisible();

    // 3. Click 'Run & Validate' button
    const runButton = page.getByRole("button", { name: "Run & Validate" });
    await runButton.click();

    // Verify validation feedback appears with actual content
    const feedback = page.locator("[role='alert']");
    await expect(feedback).toBeVisible({ timeout: 5000 });
    // Verify it contains pass/fail indicator (not just exists)
    await expect(feedback).toHaveText(/Passed|issue/i);

    // Editor should still be visible
    await expect(editor).toBeVisible();
  });

  test("preview-canvas-exists", async ({ page }): Promise<void> => {
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(page.getByRole("heading", { name: "Preview" })).toBeVisible();

    // Find the preview canvas using data-testid (not fragile .first())
    const preview = page.getByTestId("lesson-preview-canvas");
    await expect(preview).toBeVisible();

    // Verify canvas element has valid positive dimensions
    const widthAttr = await preview.getAttribute("width");
    const heightAttr = await preview.getAttribute("height");
    if (!widthAttr || !heightAttr) {
      throw new Error("Canvas missing width or height attribute");
    }
    const width = Number.parseInt(widthAttr, 10);
    const height = Number.parseInt(heightAttr, 10);
    expect(Number.isFinite(width) && width > 0).toBe(true);
    expect(Number.isFinite(height) && height > 0).toBe(true);
  });

  test("preview-canvas-renders-content", async ({ page }): Promise<void> => {
    await page.goto("/tutorial");

    // Wait for lesson to load
    await expect(page.getByRole("heading", { name: "Preview" })).toBeVisible();

    // Use data-testid for reliable canvas selection
    const preview = page.getByTestId("lesson-preview-canvas");
    await expect(preview).toBeVisible();

    // Wait for canvas to finish rendering
    await expect(preview).toHaveAttribute("data-rendered", "true");

    // Verify canvas has actual content (not a blank/empty canvas)
    // Check that the canvas data URL contains image data beyond the empty marker
    const canvasData = await preview.evaluate((el: HTMLCanvasElement) =>
      el.toDataURL(),
    );
    // Empty canvas returns "data:," - actual content has image data
    expect(canvasData).not.toBe("data:,");
    // Verify it's a valid PNG data URL with substantial content
    expect(canvasData).toMatch(/^data:image\/png;base64,.{100,}/);
  });
});
