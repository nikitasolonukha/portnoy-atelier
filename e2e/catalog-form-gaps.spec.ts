import { expect, test } from "@playwright/test";

test("catalog manufacturer, composition, newest sort and view preference work together", async ({ page }) => {
  await page.goto("/fabrics");
  await page.getByRole("button", { name: /^Фабрика:/ }).click();
  await page.getByRole("checkbox", { name: "Vitale Barberis Canonico" }).check();
  await page.getByRole("button", { name: /^Фабрика:/ }).click();
  await page.getByRole("button", { name: /^Состав:/ }).click();
  await page.getByRole("checkbox", { name: "100% шерсть", exact: true }).check();
  await page.getByRole("button", { name: /^Состав:/ }).click();
  await page.getByRole("button", { name: /^Сортировка:/ }).click();
  await page.locator(".filter-panel").getByRole("button", { name: "Сначала старые", exact: true }).click();
  await expect(page.locator(".fabric-tile__name, .font-display").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Сортировка: Сначала старые" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Фабрика: Vitale Barberis Canonico|Фабрика: \d+ выбр\./ })).toBeVisible();

  await page.getByRole("button", { name: "Списком" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Списком" })).toHaveAttribute("data-active", "true");
  await expect(page.getByRole("button", { name: "Плиткой" })).toHaveAttribute("data-active", "false");
});

test("fabric form supports save to configurator and unsaved leave guard", async ({ page }) => {
  const article = `CFG-${Date.now()}`;
  await page.goto("/fabrics/new");
  await page.getByLabel("Артикул").fill(article);
  await page.getByLabel("Название").fill("Configurator wool");
  await page.getByLabel("Производитель").fill("Guard Mill");
  await page.getByRole("button", { name: "Назад" }).click();
  await expect(page.getByRole("heading", { name: "Есть несохранённые изменения." })).toBeVisible();
  await page.getByRole("button", { name: "Остаться" }).click();
  await page.getByRole("button", { name: "Сохранить и открыть в конфигураторе" }).click();
  await expect(page).toHaveURL(/\/configurator\?fabric=/);
  await expect(page.getByRole("heading", { name: "Конфигуратор" })).toBeVisible();
});
