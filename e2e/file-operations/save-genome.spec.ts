// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("File Operations", () => {
  test("save-genome-file", async ({ page, isMobile }) => {
    // 1. Navigate to playground
    await page.goto("/");

    // 2. Verify default genome is present
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toHaveValue("ATG GAA AAT GGA TAA");

    // 3. Click 'Save' button and handle download (via overflow menu on mobile)
    const downloadPromise = page.waitForEvent("download");

    if (isMobile) {
      await page.getByRole("button", { name: "More actions" }).click();
      await page.getByRole("button", { name: "Save" }).click();
    } else {
      await page.getByRole("button", { name: "Save genome file" }).click();
    }

    const download = await downloadPromise;

    // 4. Verify download was triggered
    expect(download.suggestedFilename()).toMatch(/\.genome$/);
  });
});
