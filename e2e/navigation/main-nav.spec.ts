// spec: e2e/test-plan.md
// seed: e2e/seed.spec.ts

import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("main-navigation-links", async ({ page, isMobile }) => {
    // 1. Navigate to homepage
    await page.goto("/");

    // Helper to navigate - on mobile we need to open the menu first
    async function navigateTo(linkName: string) {
      if (isMobile) {
        // Open mobile menu
        const menuButton = page.getByRole("button", { name: /open menu/i });
        if (await menuButton.isVisible()) {
          await menuButton.click();
          // Wait for drawer animation
          await page.waitForTimeout(300);
        }
      }
      await page.getByRole("link", { name: linkName }).click();
    }

    // Verify initial state - on desktop nav is visible, on mobile we need to check for menu button
    if (isMobile) {
      await expect(
        page.getByRole("button", { name: /open menu/i }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("link", { name: "Playground" }),
      ).toBeVisible();
    }

    // 2. Click 'Gallery' link and verify URL
    await navigateTo("Gallery");
    await expect(page).toHaveURL("/gallery");
    await expect(
      page.getByRole("heading", { name: "Example Gallery" }),
    ).toBeVisible();

    // 3. Click 'Tutorial' link and verify URL
    await navigateTo("Tutorial");
    await expect(page).toHaveURL("/tutorial");

    // 4. Click 'Demos' link and verify URL
    await navigateTo("Demos");
    await expect(page).toHaveURL("/demos");

    // 5. Click logo to return to homepage
    await page.getByRole("link", { name: "CodonCanvas DNA" }).click();
    await expect(page).toHaveURL("/");

    // Verify we're back on the playground
    await expect(
      page.getByRole("textbox", { name: "Genome editor" }),
    ).toBeVisible();
  });
});
