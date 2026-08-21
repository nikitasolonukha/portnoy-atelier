import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

const IMPORT_PHOTO_URL = "https://httpbin.org/image/png";

test("supabase CSV import downloads https imageUrl into fabric storage", async ({ page, request }) => {
  test.setTimeout(120_000);
  const probe = await request.get(IMPORT_PHOTO_URL);
  test.skip(!probe.ok(), "https image fixture host unavailable");

  const suffix = Date.now();
  const article = `E2E-URL-${suffix}`;
  const csv = [
    "SKU,Title,Photo",
    `${article},Imported with URL,${IMPORT_PHOTO_URL}`,
  ].join("\n");

  await loginAs(page, "admin");
  await page.goto("/fabrics/import");
  await page.locator('input[type="file"]').setInputFiles({
    name: "import-photo.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf8"),
  });
  await page.getByRole("button", { name: "Проверить строки" }).click();
  await page.getByRole("button", { name: "Импортировать 1 строк" }).click();
  await expect(page.getByRole("heading", { name: "Импорт завершён" })).toBeVisible();
  await expect(page.getByText(/Создано: 1\. Обновлено: 0\. Пропущено: 0\. Ошибок: 0\./)).toBeVisible();

  await page.goto("/fabrics");
  await page.getByPlaceholder("Поиск").fill(article);
  await page.getByRole("link", { name: /Imported with URL/ }).click();
  await expect(page.getByRole("heading", { name: "Imported with URL" })).toBeVisible();
  await expect(page.locator("img").first()).toBeVisible();
});
