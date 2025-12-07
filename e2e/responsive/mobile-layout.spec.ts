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
  test.describe("mobile viewport (375x667)", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("homepage layout adapts correctly", async ({
      page,
    }): Promise<void> => {
      await page.goto("/");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

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

      // Mobile-specific: hamburger menu visible, desktop nav hidden
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Primary navigation" }),
      ).not.toBeVisible();

      // Mobile-specific: overflow menu visible, desktop I/O buttons hidden
      await expect(
        page.getByRole("button", { name: "More actions" }),
      ).toBeVisible();
      await expect(page.getByText("Load", { exact: true })).not.toBeVisible();
    });

    test("gallery layout adapts correctly", async ({ page }): Promise<void> => {
      await page.goto("/gallery");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

      // Core elements visible
      await expect(
        page.getByRole("heading", { name: "Example Gallery" }),
      ).toBeVisible();
      await expect(
        page.getByRole("searchbox", { name: "Search examples" }),
      ).toBeVisible();

      // Mobile-specific: hamburger menu visible
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).toBeVisible();
    });

    test("tutorial layout adapts correctly", async ({
      page,
    }): Promise<void> => {
      await page.goto("/tutorial");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

      // Mobile-specific: FAB visible, fixed sidebar hidden
      await expect(
        page.getByRole("button", { name: "Open lesson menu" }),
      ).toBeVisible();
      await expect(page.locator("aside")).not.toBeVisible();

      // Mobile-specific: hamburger menu visible
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).toBeVisible();
    });

    test("mobile menu navigation works", async ({ page }): Promise<void> => {
      await page.goto("/");

      // Open mobile menu
      const menuButton = page.getByRole("button", { name: "Open menu" });
      await expect(menuButton).toBeVisible();
      await menuButton.click();

      // Menu drawer should be visible with navigation links
      await expect(page.getByRole("link", { name: "Gallery" })).toBeVisible();

      // Navigate to Gallery via mobile menu
      await page.getByRole("link", { name: "Gallery" }).click();

      // Verify navigation worked
      await expect(page).toHaveURL(/\/gallery/);
      await expect(
        page.getByRole("heading", { name: "Example Gallery" }),
      ).toBeVisible();
    });
  });

  test.describe("tablet viewport (768x1024)", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("homepage layout adapts correctly", async ({
      page,
    }): Promise<void> => {
      await page.goto("/");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

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

      // Tablet/Desktop: desktop nav visible, hamburger hidden
      await expect(
        page.getByRole("navigation", { name: "Primary navigation" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).not.toBeVisible();

      // Tablet/Desktop: desktop I/O buttons visible, overflow menu hidden
      await expect(page.getByText("Load", { exact: true })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "More actions" }),
      ).not.toBeVisible();
    });

    test("gallery layout adapts correctly", async ({ page }): Promise<void> => {
      await page.goto("/gallery");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

      // Core elements visible
      await expect(
        page.getByRole("heading", { name: "Example Gallery" }),
      ).toBeVisible();
      await expect(
        page.getByRole("searchbox", { name: "Search examples" }),
      ).toBeVisible();

      // Tablet/Desktop: desktop nav visible, hamburger hidden
      await expect(
        page.getByRole("navigation", { name: "Primary navigation" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).not.toBeVisible();
    });

    test("tutorial layout adapts correctly", async ({
      page,
    }): Promise<void> => {
      await page.goto("/tutorial");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

      // Tablet/Desktop: fixed sidebar visible, FAB hidden
      await expect(page.locator("aside")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Open lesson menu" }),
      ).not.toBeVisible();

      // Tablet/Desktop: desktop nav visible, hamburger hidden
      await expect(
        page.getByRole("navigation", { name: "Primary navigation" }),
      ).toBeVisible();
    });
  });

  test.describe("desktop viewport (1280x800)", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("homepage layout adapts correctly", async ({
      page,
    }): Promise<void> => {
      await page.goto("/");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

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

      // Desktop: desktop nav visible, hamburger hidden
      await expect(
        page.getByRole("navigation", { name: "Primary navigation" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).not.toBeVisible();

      // Desktop: desktop I/O buttons visible, overflow menu hidden
      await expect(page.getByText("Load", { exact: true })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "More actions" }),
      ).not.toBeVisible();
    });

    test("gallery layout adapts correctly", async ({ page }): Promise<void> => {
      await page.goto("/gallery");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

      // Core elements visible
      await expect(
        page.getByRole("heading", { name: "Example Gallery" }),
      ).toBeVisible();
      await expect(
        page.getByRole("searchbox", { name: "Search examples" }),
      ).toBeVisible();

      // Desktop: desktop nav visible, hamburger hidden
      await expect(
        page.getByRole("navigation", { name: "Primary navigation" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).not.toBeVisible();
    });

    test("tutorial layout adapts correctly", async ({
      page,
    }): Promise<void> => {
      await page.goto("/tutorial");

      // No horizontal overflow
      expect(await hasNoHorizontalOverflow(page)).toBe(true);

      // Desktop: fixed sidebar visible, FAB hidden
      await expect(page.locator("aside")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Open lesson menu" }),
      ).not.toBeVisible();

      // Desktop: desktop nav visible, hamburger hidden
      await expect(
        page.getByRole("navigation", { name: "Primary navigation" }),
      ).toBeVisible();
    });
  });
});
