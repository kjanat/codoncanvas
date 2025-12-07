// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Responsive Design", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile-viewport-layout", async ({ page }): Promise<void> => {
    // Homepage layout
    await page.goto("/");

    // No horizontal overflow
    const hasNoOverflow = await page.evaluate(
      () =>
        window.innerWidth >=
        (document.scrollingElement?.scrollWidth ?? document.body.scrollWidth),
    );
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
    const galleryHasNoOverflow = await page.evaluate(
      () =>
        window.innerWidth >=
        (document.scrollingElement?.scrollWidth ?? document.body.scrollWidth),
    );
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
