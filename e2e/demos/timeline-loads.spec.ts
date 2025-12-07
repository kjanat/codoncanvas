// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Timeline Demo", () => {
  test("timeline-demo-loads", async ({ page }): Promise<void> => {
    // 1. Navigate to /demos/timeline
    await page.goto("/demos/timeline");

    // 2. Verify page heading
    await expect(
      page.getByRole("heading", { name: /timeline/i }),
    ).toBeVisible();

    // 3. Verify genome textbox is present (by accessible name)
    const genomeInput = page.getByRole("textbox", {
      name: /Genome editor/i,
    });
    await expect(genomeInput).toBeVisible();

    // 4. Verify 'Run & Capture Timeline' button exists
    await expect(
      page.getByRole("button", { name: /run.*capture|capture.*timeline/i }),
    ).toBeVisible();

    // 5. Verify canvas is present
    await expect(page.locator("canvas")).toBeVisible();

    // 6. VM State panel shows heading
    await expect(page.getByRole("heading", { name: "VM State" })).toBeVisible();
  });
});
