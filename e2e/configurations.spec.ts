import { test, expect } from "@playwright/test";

test("configuration survives save and can be duplicated", async ({ page }) => {
  const name = `E2E suit ${Date.now()}`;
  await page.goto("/configurator");
  for (let index = 0; index < 6; index += 1) await page.getByRole("button", { name: /Далее/ }).click();
  await page.getByLabel("Название конфигурации").fill(name);
  await page.getByRole("button", { name: "Сохранить конфигурацию" }).click();
  await expect(page.getByRole("button", { name: "Сохранено" })).toBeVisible();
  await page.goto("/configurations");
  await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
  await page.getByRole("button", { name: `Дублировать ${name}` }).click();
  await expect(page.getByRole("link", { name: `${name} — копия`, exact: true })).toBeVisible();
});

test("two saved variants can be compared", async ({ page }) => {
  await page.goto("/configurations");
  const checkboxes = page.getByRole("checkbox");
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await page.getByRole("link", { name: /Сравнить 2\/2/ }).click();
  await expect(page.getByRole("heading", { name: "Сравнение вариантов" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Параметры" })).toBeVisible();
  await expect(page.getByText("Отличия выделены")).toBeVisible();
});
