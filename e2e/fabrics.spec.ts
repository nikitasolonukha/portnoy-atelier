import { test, expect } from "@playwright/test";

test("admin creates and archives a fabric", async ({ page }) => {
  const article = `PW-${Date.now()}`;
  await page.goto("/fabrics/new");
  await page.getByLabel("Артикул").fill(article);
  await page.getByLabel("Название").fill("Playwright navy wool");
  await page.getByLabel("Производитель").fill("Test Mill");
  await page.getByLabel("Состав").fill("100% шерсть");
  await page.getByLabel("Основной цвет").fill("Синий");
  await page.getByLabel("Цена за метр").fill("12500");
  await page.getByRole("button", { name: "Сохранить ткань" }).click();
  await expect(page.getByRole("heading", { name: "Playwright navy wool" })).toBeVisible();
  await page.getByRole("button", { name: "Архивировать" }).click();
  await expect(page.getByText("В архиве", { exact: true })).toBeVisible();
});

test("CSV import validates and adds both rows", async ({ page }) => {
  await page.goto("/fabrics/import");
  await page.locator('input[type="file"]').setInputFiles("e2e/fixtures/fabrics.csv");
  await expect(page.getByText("2 строк", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("CSV-9001", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Импортировать 2 строк/ }).click();
  await expect(page.getByRole("status")).toContainText("Импортировано: 2");
  await page.getByRole("link", { name: "Открыть каталог" }).click();
  await page.getByPlaceholder("Артикул, название, фабрика").fill("CSV-9001");
  await expect(page.getByRole("heading", { name: "Test Navy Fresco" })).toBeVisible();
});
