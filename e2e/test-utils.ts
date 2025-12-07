/**
 * Shared test utilities for E2E tests
 */

import type { Page } from "@playwright/test";

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
