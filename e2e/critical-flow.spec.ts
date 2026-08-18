import { test, expect } from "@playwright/test";

test("login opens the atelier workspace", async ({ page }) => {
  await page.goto("/login");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Рабочий стол" })).toBeVisible();
});

test("fabric catalog search and configurator work", async ({ page }) => {
  await page.goto("/fabrics");
  await page.getByPlaceholder("Артикул, название, фабрика").fill("VB-2401");
  await expect(page.getByRole("heading", { name: "Midnight Hopsack" })).toBeVisible();
  await page.goto("/configurator");
  await page.waitForTimeout(500);
  await expect(page.getByRole("heading", { name: "Конфигуратор" })).toBeVisible();
  await page.getByRole("button", { name: /Midnight Hopsack/ }).click();
  await page.getByRole("button", { name: /Далее/ }).click();
  await expect(page.getByRole("heading", { name: "Пиджак" })).toBeVisible();
});
