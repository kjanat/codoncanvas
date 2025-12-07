// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { promises as fs } from "node:fs";
import { expect, test } from "@playwright/test";
import { DEFAULT_GENOME } from "../support/constants";

test.describe("File Operations", () => {
  test("save-genome-file", async ({ page, isMobile }): Promise<void> => {
    await page.goto("/");

    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toHaveValue(DEFAULT_GENOME);

    // Click Save button (via overflow menu on mobile)
    const downloadPromise = page.waitForEvent("download");

    if (isMobile) {
      await page.getByRole("button", { name: "More actions" }).click();
      await page.getByRole("button", { name: "Save" }).click();
    } else {
      await page.getByRole("button", { name: "Save genome file" }).click();
    }

    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toMatch(/\.genome$/);

    // Verify file exists and has content
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
