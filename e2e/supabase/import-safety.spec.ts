import { expect, test } from "@playwright/test";
import { loginAs, serviceClient } from "./helpers";

async function importCsv(page: import("@playwright/test").Page, name: string, csv: string) {
  await page.goto("/fabrics/import");
  await page.locator('input[type="file"]').setInputFiles({ name, mimeType: "text/csv", buffer: Buffer.from(csv, "utf8") });
  await page.getByRole("button", { name: "Проверить строки" }).click();
  await page.getByLabel("Обновить существующие").check();
  await page.getByRole("button", { name: /Импортировать 1 строк/ }).click();
  await expect(page.getByRole("heading", { name: "Импорт завершён" })).toBeVisible();
}

test("partial import preserves unmapped fields and applies explicit mapped values", async ({ page }) => {
  const suffix = Date.now();
  const article = `E2E-PATCH-${suffix}`;
  const service = serviceClient();
  await loginAs(page, "admin");
  const created = await page.evaluate(async ({ article }) => {
    const response = await fetch("/api/v1/fabrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ article, name: "Navy Wool", manufacturer: "Loro Piana", composition: "100% Wool", currency: "EUR" }) });
    return { status: response.status, body: await response.json() };
  }, { article });
  expect(created.status).toBe(201);

  try {
    await importCsv(page, `preserve-${suffix}.csv`, `SKU,Title\n${article},Updated Navy`);
    let record = await service.from("fabrics").select("name,manufacturer,composition,currency").eq("article", article).single();
    expect(record.data).toEqual({ name: "Updated Navy", manufacturer: "Loro Piana", composition: "100% Wool", currency: "EUR" });

    await importCsv(page, `mapped-${suffix}.csv`, `SKU,Title,Brand\n${article},Updated Again,Vitale Barberis`);
    record = await service.from("fabrics").select("name,manufacturer,composition,currency").eq("article", article).single();
    expect(record.data).toEqual({ name: "Updated Again", manufacturer: "Vitale Barberis", composition: "100% Wool", currency: "EUR" });

    await importCsv(page, `blank-${suffix}.csv`, `SKU,Title,Brand\n${article},Updated Blank,`);
    record = await service.from("fabrics").select("name,manufacturer,composition,currency").eq("article", article).single();
    expect(record.data).toEqual({ name: "Updated Blank", manufacturer: "", composition: "100% Wool", currency: "EUR" });
  } finally {
    await service.from("fabrics").delete().eq("article", article);
  }
});