import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("employee UI and API are read-only for fabrics", async ({ page }) => {
  await loginAs(page, "employee");
  await page.goto("/fabrics");
  await expect(page.getByRole("link", { name: "Добавить ткань" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Импорт" })).toHaveCount(0);
  const result = await page.evaluate(async () => {
    const response = await fetch("/api/v1/fabrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ article: "E2E-EMPLOYEE", name: "Forbidden" }) });
    return { status: response.status, body: await response.json() };
  });
  expect(result.status).toBe(403);
  expect(result.body.error.code).toBe("forbidden");
});

test("tailor can create/update but cannot delete fabrics", async ({ page }) => {
  await loginAs(page, "tailor");
  await page.goto("/fabrics");
  await expect(page.getByRole("link", { name: "Добавить ткань" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Импорт" })).toBeVisible();
  const created = await page.evaluate(async () => {
    const create = await fetch("/api/v1/fabrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ article: "E2E-TAILOR", name: "Tailor fabric" }) });
    const payload = await create.json();
    const update = await fetch(`/api/v1/fabrics/${payload.data.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Tailor fabric updated" }) });
    const remove = await fetch(`/api/v1/fabrics/${payload.data.id}`, { method: "DELETE" });
    return { id: payload.data.id, create: create.status, update: update.status, remove: remove.status, removeBody: await remove.json() };
  });
  expect(created).toMatchObject({ create: 201, update: 200, remove: 403, removeBody: { error: { code: "forbidden" } } });
  await page.goto(`/fabrics/${created.id}`);
  await expect(page.getByRole("link", { name: "Редактировать" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Удалить" })).toHaveCount(0);
});

test("admin can delete an unreferenced fabric", async ({ page }) => {
  await loginAs(page, "admin");
  const result = await page.evaluate(async () => {
    const create = await fetch("/api/v1/fabrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ article: "E2E-ADMIN-DELETE", name: "Admin disposable" }) });
    const payload = await create.json();
    const remove = await fetch(`/api/v1/fabrics/${payload.data.id}`, { method: "DELETE" });
    return { create: create.status, remove: remove.status };
  });
  expect(result).toEqual({ create: 201, remove: 204 });
});
