import { expect, test } from "@playwright/test";
import { authenticatedClient, goToSummary, loginAs, serviceClient } from "./helpers";

test("real Supabase critical flow works on the current responsive device", async ({ page }, testInfo) => {
  const service = serviceClient();
  const admin = await authenticatedClient("admin");
  const suffix = `${Date.now()}-${testInfo.project.name}`;
  const article = `E2E-SMOKE-${suffix}`.slice(0, 80);
  const fabricName = `Responsive wool ${suffix}`;
  const configurationName = `Responsive suit ${suffix}`.slice(0, 120);
  const { data: fabric, error } = await admin.from("fabrics").insert({ article, name: fabricName, manufacturer: "Responsive Mill" }).select("id").single();
  if (error) throw error;

  try {
    await loginAs(page, "admin");
    await page.goto("/fabrics");
    await page.getByLabel("Поиск тканей").fill(article);
    await page.getByRole("link").filter({ has: page.getByRole("heading", { name: fabricName, exact: true }) }).click();
    await expect(page.getByRole("heading", { name: fabricName })).toBeVisible();
    await page.getByRole("link", { name: "В конфигуратор" }).click();
    await goToSummary(page);
    await page.getByLabel("Название конфигурации").fill(configurationName);
    await page.getByRole("button", { name: "Сохранить конфигурацию" }).click();
    await expect(page).toHaveURL(/\/configurator\/[^/?]+$/);
    await expect(page.getByRole("status")).toHaveText("Все изменения сохранены");
    await page.reload();
    await goToSummary(page);
    await expect(page.getByLabel("Название конфигурации")).toHaveValue(configurationName);
    const logout = page.getByRole("button", { name: "Выйти" });
    if (!(await logout.isVisible())) await page.getByRole("button", { name: "Открыть меню" }).click();
    await logout.click();
    await expect(page).toHaveURL(/\/login$/);
  } finally {
    await service.from("configurations").delete().eq("name", configurationName);
    await service.from("fabrics").delete().eq("id", fabric.id);
  }
});