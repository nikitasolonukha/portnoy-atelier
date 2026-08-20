import { test, expect } from "@playwright/test";
import * as XLSX from "xlsx";

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

test("CSV import maps columns, previews and adds all valid rows", async ({ page }, testInfo) => {
  const suffix = `${Date.now()}-${testInfo.project.name}`;
  const firstArticle = `CSV-${suffix}-1`;
  const secondArticle = `CSV-${suffix}-2`;
  await page.goto("/fabrics/import");
  await page.locator('input[type="file"]').setInputFiles({
    name: "fabrics.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(`SKU,Title,Brand\n${firstArticle},Test Navy Fresco,Test Mill\n${secondArticle},Test Grey Flannel,Test Mill`, "utf8"),
  });
  await expect(page.getByRole("heading", { name: "Сопоставление колонок" })).toBeVisible();
  await page.getByRole("button", { name: "Проверить строки" }).click();
  await expect(page.getByText(firstArticle.toUpperCase(), { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Импортировать 2 строк/ }).click();
  await expect(page.getByRole("heading", { name: "Импорт завершён" })).toBeVisible();
  await expect(page.getByText(/Создано: 2\. Обновлено: 0\. Пропущено: 0\. Ошибок: 0\./)).toBeVisible();
  await page.getByRole("link", { name: "Открыть каталог" }).click();
  await page.getByPlaceholder("Артикул, название, фабрика").fill(firstArticle);
  await expect(page.locator(".fabric-tile__name", { hasText: "Test Navy Fresco" })).toBeVisible();
});

test("XLSX and legacy XLS imports use the same validated workflow", async ({ page }) => {
  const suffix = Date.now();
  for (const file of [
    { extension: "xlsx", bookType: "xlsx" as const, article: `XLSX-${suffix}` },
    { extension: "xls", bookType: "biff8" as const, article: `XLS-${suffix}` },
  ]) {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Артикул", "Название", "Производитель"],
      [file.article, `${file.extension.toUpperCase()} fabric`, "Binary Mill"],
    ]), "Fabrics");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: file.bookType });

    await page.goto("/fabrics/import");
    await page.locator('input[type="file"]').setInputFiles({ name: `fabrics.${file.extension}`, mimeType: "application/octet-stream", buffer });
    await expect(page.getByRole("heading", { name: "Сопоставление колонок" })).toBeVisible();
    await page.getByRole("button", { name: "Проверить строки" }).click();
    await expect(page.getByText(file.article, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /Импортировать 1 строк/ }).click();
    await expect(page.getByText(/Создано: 1\. Обновлено: 0\. Пропущено: 0\. Ошибок: 0\./)).toBeVisible();
  }
});
test("manual column mapping imports unknown headers through the validated workflow", async ({ page }) => {
  const article = `MANUAL-${Date.now()}`;
  await page.goto("/fabrics/import");
  await page.locator('input[type="file"]').setInputFiles({
    name: "manual.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(`Code,Label,Mass\n${article},Manually mapped wool,280`, "utf8"),
  });
  await page.getByRole("combobox", { name: "Code" }).selectOption("article");
  await page.getByRole("combobox", { name: "Label" }).selectOption("name");
  await page.getByRole("combobox", { name: "Mass" }).selectOption("weightGsm");
  await page.getByRole("button", { name: "Проверить строки" }).click();
  await expect(page.getByText(article, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Импортировать 1 строк" }).click();
  await expect(page.getByText(/Создано: 1\. Обновлено: 0\. Пропущено: 0\. Ошибок: 0\./)).toBeVisible();
});