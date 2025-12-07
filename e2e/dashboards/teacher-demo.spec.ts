// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Teacher Dashboard Demo Data", () => {
  test("load-demo-data-populates-dashboard", async ({
    page,
  }): Promise<void> => {
    // 1. Navigate to /dashboards/teacher
    await page.goto("/dashboards/teacher");

    // 2. Click "Load Demo Data" button (use the one in header)
    await page.getByRole("button", { name: "Load Demo Data" }).first().click();

    // 3. Verify dashboard populates - stat cards should appear
    await expect(page.getByText("Total Students")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Avg Sessions")).toBeVisible();
  });

  test("analytics-tables-display-after-demo-load", async ({
    page,
  }): Promise<void> => {
    await page.goto("/dashboards/teacher");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Data" }).first().click();

    // Wait for data to load
    await expect(page.getByText("Total Students")).toBeVisible({
      timeout: 5000,
    });

    // Verify at least one table is present
    await expect(page.locator("table").first()).toBeVisible();
  });

  test("export-options-visible-after-demo-load", async ({
    page,
  }): Promise<void> => {
    await page.goto("/dashboards/teacher");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Data" }).first().click();

    // Wait for data to load
    await expect(page.getByText("Total Students")).toBeVisible({
      timeout: 5000,
    });

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
    await page.goto("/dashboards/teacher");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Data" }).first().click();

    // Wait for data to load
    await expect(page.getByText("Total Students")).toBeVisible({
      timeout: 5000,
    });

    // Verify At Risk stat card is visible (first one is the stat card label)
    await expect(page.getByText("At Risk").first()).toBeVisible();
  });
});
