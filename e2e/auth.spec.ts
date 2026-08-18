import { test, expect } from "@playwright/test";

test("invalid demo credentials show an accessible error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("wrong@example.com");
  await page.locator("#password").fill("wrong-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page.locator("#password-error")).toContainText("Проверьте email и пароль");
  await expect(page).toHaveURL(/login/);
});
