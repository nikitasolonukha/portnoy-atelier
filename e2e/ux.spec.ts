import { expect, test } from "@playwright/test";

test("key Stage 1 routes do not overflow the viewport", async ({ page }) => {
  for (const route of ["/dashboard", "/fabrics", "/configurator", "/configurations", "/configurations/compare?left=c1&right=c2"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} has horizontal page overflow`).toBeLessThanOrEqual(1);
  }
});

test("mobile navigation exposes state, closes on Escape and restores focus", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 9999) > 900, "off-canvas navigation applies at 900px and below");
  await page.goto("/dashboard");
  const opener = page.getByRole("button", { name: "Открыть меню" });
  await expect(opener).toHaveAttribute("aria-expanded", "false");
  await opener.click();
  await expect(opener).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("complementary", { name: "Основная навигация" })).toHaveAttribute("data-open", "true");
  await page.keyboard.press("Escape");
  await expect(opener).toHaveAttribute("aria-expanded", "false");
  await expect(opener).toBeFocused();
});

test("import reports partial success and row errors truthfully", async ({ page }) => {
  const article = `UX-${Date.now()}`;
  await page.goto("/fabrics/import");
  await page.locator('input[type="file"]').setInputFiles({
    name: "partial.csv", mimeType: "text/csv", buffer: Buffer.from(`SKU,Title\n${article},Valid row\n,Invalid row`, "utf8"),
  });
  await page.getByRole("button", { name: "Проверить строки" }).click();
  await expect(page.getByText("Укажите артикул", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Импортировать 2 строк" }).click();
  await expect(page.getByRole("heading", { name: "Импорт завершён частично" })).toBeVisible();
  await expect(page.getByText(/Создано: 1\. Обновлено: 0\. Пропущено: 0\. Ошибок: 1\./)).toBeVisible();
});

test("configuration validation error remains actionable", async ({ page }) => {
  await page.goto("/configurator");
  for (let index = 0; index < 6; index += 1) await page.getByRole("button", { name: "Далее" }).click();
  await page.getByLabel("Название конфигурации").fill("");
  await page.getByRole("button", { name: "Сохранить конфигурацию" }).click();
  await expect(page.getByText("Укажите название конфигурации", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Название конфигурации")).toHaveAttribute("aria-invalid", "true");
});
