import { test, expect } from "@playwright/test";

async function goToSummary(page: import("@playwright/test").Page) {
  for (let index = 0; index < 6; index += 1) await page.getByRole("button", { name: "Далее" }).click();
}

test("configuration uses canonical URL, survives reload and repeated save updates one record", async ({ page }) => {
  const name = `E2E suit ${Date.now()}`;
  const updatedName = `${name} updated`;
  await page.goto("/configurator");
  await goToSummary(page);
  await page.getByLabel("Название конфигурации").fill(name);
  await page.getByRole("button", { name: "Сохранить конфигурацию" }).click();
  await expect(page).toHaveURL(/\/configurator\/[^/?]+$/);
  const canonicalUrl = page.url();
  await expect(page.getByRole("status")).toHaveText("Все изменения сохранены");

  await page.reload();
  await goToSummary(page);
  await expect(page.getByLabel("Название конфигурации")).toHaveValue(name);
  await page.getByLabel("Название конфигурации").fill(updatedName);
  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page.getByRole("status")).toHaveText("Все изменения сохранены");
  await expect(page).toHaveURL(canonicalUrl);

  await page.goto(canonicalUrl);
  await goToSummary(page);
  await expect(page.getByLabel("Название конфигурации")).toHaveValue(updatedName);
  await page.goto("/configurations");
  await expect(page.getByRole("link", { name: updatedName, exact: true })).toHaveCount(1);
  await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
});

test("duplicate opens an independent canonical copy", async ({ page }) => {
  await page.goto("/configurations");
  const original = page.getByRole("link", { name: "Городской синий", exact: true });
  await Promise.all([
    page.waitForURL(/\/configurator\/[^/?]+$/),
    original.click(),
  ]);
  const originalUrl = page.url();
  await page.waitForLoadState("networkidle");
  await page.goto("/configurations", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/configurations/);
  await page.getByRole("button", { name: "Дублировать Городской синий", exact: true }).click();
  await expect(page).toHaveURL(/\/configurator\/[^/?]+$/);
  expect(page.url()).not.toBe(originalUrl);
  await goToSummary(page);
  await expect(page.getByLabel("Название конфигурации")).toHaveValue("Городской синий — копия");
  await page.getByLabel("Название конфигурации").fill("Независимая копия");
  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page.getByRole("status")).toHaveText("Все изменения сохранены");
  await page.goto(originalUrl);
  await goToSummary(page);
  await expect(page.getByLabel("Название конфигурации")).toHaveValue("Городской синий");
});

test("compare includes fabric and all six suit option groups", async ({ page }) => {
  await page.goto("/configurations");
  const checkboxes = page.getByRole("checkbox");
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await page.getByRole("button", { name: "Сравнить 2/2" }).click();
  await expect(page.getByRole("heading", { name: "Сравнение" })).toBeVisible();
  await expect(page.locator("[data-compare-row='fabric']")).toBeVisible();
  await expect(page.locator("[data-compare-row]")).toHaveCount(7);
});

test("dirty draft warns before browser reload", async ({ page }) => {
  await page.goto("/configurator");
  await page.getByRole("button", { name: "Далее" }).click();
  await page.getByRole("button", { name: /Двубортный/ }).click();
  await expect(page.getByRole("status")).toHaveText("Есть несохранённые изменения");
  let warned = false;
  page.once("dialog", async (dialog) => { warned = dialog.type() === "beforeunload"; await dialog.dismiss(); });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 2_000 }).catch(() => undefined);
  expect(warned).toBe(true);
  await expect(page.getByRole("status")).toHaveText("Есть несохранённые изменения");
});
test("invalid compare IDs show an explicit empty state instead of fallback records", async ({ page }) => {
  await page.goto("/configurations/compare?left=missing-left&right=missing-right");
  await expect(page.getByRole("alert").filter({ has: page.getByRole("heading", { name: "Нужно выбрать две разные конфигурации" }) })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Сравнение" })).toHaveCount(0);
  await expect(page.locator("[data-compare-row]")).toHaveCount(0);
});