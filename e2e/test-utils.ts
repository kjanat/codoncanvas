/**
 * Shared test utilities for E2E tests
 */

import { expect, type Page } from "@playwright/test";

export interface StepInfo {
  current: number;
  total: number;
}

/** Parse step indicator text "Step X of Y" into numbers. Throws on invalid input. */
export async function getStepInfo(page: Page): Promise<StepInfo> {
  const stepText = await page.getByText(/step \d+ of \d+/i).textContent();
  if (!stepText) throw new Error("Step indicator not found");
  const match = stepText.match(/step (\d+) of (\d+)/i);
  if (!match) throw new Error(`Failed to parse step text: "${stepText}"`);
  return {
    current: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
  };
}

/** Start an assessment challenge with the given difficulty */
export async function startAssessmentChallenge(
  page: Page,
  difficulty: "Easy" | "Medium" | "Hard" = "Easy",
): Promise<void> {
  await page.goto("/demos/assessment");
  await page.getByRole("button", { name: difficulty }).click();
  await page.getByRole("button", { name: "Start Challenge" }).click();
  await expect(page.getByText("What type of mutation occurred?")).toBeVisible();
}

/** Navigate to teacher dashboard and load demo data */
export async function loadTeacherDemoData(page: Page): Promise<void> {
  await page.goto("/dashboards/teacher");
  await page.getByRole("button", { name: "Load Demo Data" }).first().click();
  await expect(page.getByText("Total Students")).toBeVisible({ timeout: 5000 });
}
