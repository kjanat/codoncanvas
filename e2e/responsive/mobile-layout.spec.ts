// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/** Check if page has no horizontal overflow */
async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      window.innerWidth >=
      (document.scrollingElement?.scrollWidth ?? document.body.scrollWidth),
  );
}

test.describe("Responsive Design", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile-viewport-layout", async ({ page }): Promise<void> => {
    // Homepage layout
    await page.goto("/");

    // No horizontal overflow
    const hasNoOverflow = await hasNoHorizontalOverflow(page);
    expect(hasNoOverflow).toBe(true);

    // Core elements visible
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Genome execution output" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Run genome" }),
    ).toBeVisible();

    // Gallery layout
    await page.goto("/gallery");

    // No horizontal overflow
    const galleryHasNoOverflow = await hasNoHorizontalOverflow(page);
    expect(galleryHasNoOverflow).toBe(true);

    // Core elements visible
    await expect(
      page.getByRole("heading", { name: "Example Gallery" }),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "Search examples" }),
    ).toBeVisible();
  });
});
