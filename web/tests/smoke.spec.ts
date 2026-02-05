import { expect, test } from "@playwright/test";

test("root redirects to /en", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en\/?$/);
});

test("/en/posts renders posts page", async ({ page }) => {
  await page.goto("/en/posts");
  await expect(page.getByRole("heading", { name: /posts/i })).toBeVisible();
});

test("navigation language dropdown exists", async ({ page }) => {
  await page.goto("/en/posts");
  const languageDropdown = page.locator('button[aria-haspopup="true"][title="English"]:visible');
  await expect(languageDropdown.first()).toBeVisible();
});
