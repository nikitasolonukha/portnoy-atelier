import { test, expect } from "@playwright/test";

test("admin edits an existing fabric through the shared form", async ({ page }) => {
  await page.goto("/fabrics/f1/edit");
  await page.getByLabel("Название").fill("Midnight Hopsack Updated");
  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page).toHaveURL(/\/fabrics\/f1$/);
  await expect(page.getByRole("heading", { name: "Midnight Hopsack Updated" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Midnight Hopsack Updated" })).toBeVisible();
});
