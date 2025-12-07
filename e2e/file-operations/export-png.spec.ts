// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { promises as fs } from "node:fs";
import { expect, test } from "@playwright/test";

test.describe("File Operations", () => {
  test("export-canvas-as-png", async ({ page }): Promise<void> => {
    // 1. Navigate to playground
    await page.goto("/");

    // 2. Run a genome to render output
    await page.getByRole("button", { name: "Run genome" }).click();

    // Verify canvas is visible
    await expect(
      page.getByRole("img", { name: "Genome execution output" }),
    ).toBeVisible();

    // 3. Click 'Export PNG' button and handle download
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export canvas as PNG" }).click();
    const download = await downloadPromise;

    // 4. Verify PNG file is downloaded
    expect(download.suggestedFilename()).toMatch(/\.png$/);

    // Verify the file actually exists and has content
    const path = await download.path();
    expect(path).toBeTruthy();

    if (path) {
      try {
        const stats = await fs.stat(path);
        expect(stats.size).toBeGreaterThan(0);
      } finally {
        await fs.unlink(path);
      }
    }
  });
});
