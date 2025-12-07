// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

import { loadTeacherDemoData } from "../test-utils";

test.describe("Teacher Dashboard Demo Data", () => {
  test.beforeEach(async ({ page }) => {
    await loadTeacherDemoData(page);
  });

  test("load-demo-data-populates-dashboard", async ({
    page,
  }): Promise<void> => {
    // Verify dashboard populates - stat cards should appear
    await expect(page.getByText("Avg Sessions")).toBeVisible();
  });

  test("analytics-tables-display-after-demo-load", async ({
    page,
  }): Promise<void> => {
    // Verify at least one table is present
    await expect(page.locator("table").first()).toBeVisible();
  });

  test("export-options-visible-after-demo-load", async ({
    page,
  }): Promise<void> => {
    // Verify Export Data section
    await expect(
      page.getByRole("heading", { name: "Export Data" }),
    ).toBeVisible();

    // Verify export buttons
    await expect(
      page.getByRole("button", { name: /Export Grading Summary/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Export Full Data/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clear All Data" }),
    ).toBeVisible();
  });

  test("at-risk-panel-displays-after-demo-load", async ({
    page,
  }): Promise<void> => {
    // Verify At Risk stat card is visible (first one is the stat card label)
    await expect(page.getByText("At Risk").first()).toBeVisible();
  });
});
