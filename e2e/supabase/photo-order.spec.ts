import { expect, test, type Page } from "@playwright/test";
import { loginAs, png } from "./helpers";

function pngNamed(name: string, r: number, g: number, b: number) {
  // Distinct 1x1 PNG payloads keep filenames and bytes unique for order assertions.
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, r, g, b, 0x00, 0x00,
    0x00, 0x03, 0x00, 0x01, 0x4e, 0xb1, 0xe5, 0x9a, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
    0xae, 0x42, 0x60, 0x82,
  ]);
  return { name, mimeType: "image/png" as const, buffer: signature };
}

async function fillFabricBasics(page: Page, article: string, name: string) {
  await page.getByLabel("Артикул").fill(article);
  await page.getByLabel("Название").fill(name);
  await page.getByLabel("Производитель").fill("Freeze Mill");
  await page.getByLabel("Состав").fill("100% шерсть");
  await page.getByLabel("Основной цвет").fill("Синий");
  await page.getByLabel("Цена за метр").fill("18000");
}

test("supabase photo draft order persists main image through reload and mixed edit", async ({ page }) => {
  test.setTimeout(180_000);
  const suffix = Date.now();
  const article = `E2E-PHOTO-${suffix}`;
  const fabricName = `Photo order ${suffix}`;

  await loginAs(page, "admin");
  await page.goto("/fabrics/new");
  await fillFabricBasics(page, article, fabricName);

  await page.locator('input[type="file"][multiple]').setInputFiles([
    pngNamed("photo-a.png", 0xff, 0x00, 0x00),
    pngNamed("photo-b.png", 0x00, 0xff, 0x00),
    pngNamed("photo-c.png", 0x00, 0x00, 0xff),
  ]);

  await page.getByRole("button", { name: "Сделать главным фото photo-c.png" }).click();
  await expect(page.getByText("Главное")).toBeVisible();
  await expect(page.getByRole("img", { name: "photo-c.png" })).toBeVisible();

  await page.getByRole("button", { name: "Сохранить ткань" }).click();
  await expect(page).toHaveURL(/\/fabrics\/[0-9a-f-]{36}$/);
  const detailUrl = page.url();
  await expect(page.locator(".fabric-dossier__photo").first()).toHaveAttribute("alt", "photo-c.png");

  await page.reload();
  await expect(page.locator(".fabric-dossier__photo").first()).toHaveAttribute("alt", "photo-c.png");

  await page.goto("/fabrics");
  await expect(page.locator(".fabric-tile").filter({ hasText: fabricName })).toBeVisible();

  await page.goto(`${detailUrl}/edit`);
  await page.locator('input[type="file"][multiple]').setInputFiles(pngNamed("photo-d.png", 0xff, 0xff, 0x00));
  // Seed after create: c, a, b → add d → c, a, b, d → main b → b, c, a, d → move d up twice → b, d, c, a
  await page.getByRole("button", { name: "Сделать главным фото photo-b.png" }).click();
  await page.getByRole("button", { name: "Переместить выше photo-d.png" }).click();
  await page.getByRole("button", { name: "Переместить выше photo-d.png" }).click();

  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page).toHaveURL(/\/fabrics\/[0-9a-f-]{36}$/);
  await page.reload();
  await expect(page.locator(".fabric-dossier__photo").first()).toHaveAttribute("alt", "photo-b.png");

  const fabricId = detailUrl.split("/").pop()!;
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const fabricResponse = await page.request.get(`/api/v1/fabrics/${fabricId}`, { headers: { cookie: cookieHeader } });
  expect(fabricResponse.status()).toBe(200);
  const fabricPayload = await fabricResponse.json();
  const orderedNames = (fabricPayload.data.assets as Array<{ type: string; sortOrder: number; originalFilename: string }>)
    .filter((asset) => asset.type === "photo")
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((asset) => asset.originalFilename);
  expect(orderedNames).toEqual(["photo-b.png", "photo-d.png", "photo-c.png", "photo-a.png"]);

  await page.goto("/fabrics");
  await expect(page.locator(".fabric-tile").filter({ hasText: fabricName })).toBeVisible();
  // Catalog uses lowest sortOrder photo via FabricMedia / fabricPhoto.

  await page.goto(`${detailUrl}/edit`);
  await page.getByLabel("Название").fill(`${fabricName} dirty`);
  await page.getByRole("link", { name: "Обзор" }).click();
  await expect(page.getByRole("heading", { name: "Есть несохранённые изменения." })).toBeVisible();
  await page.getByRole("button", { name: "Остаться" }).click();
  await expect(page).toHaveURL(new RegExp(`${detailUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/edit`));

  await page.getByRole("button", { name: "Сохранить и открыть в конфигураторе" }).click();
  await expect(page).toHaveURL(/\/configurator\?fabric=/);
});

test("photo reorder API allows admin/tailor and forbids employee", async ({ page, request }) => {
  test.setTimeout(120_000);
  const suffix = Date.now();
  const article = `E2E-API-ORD-${suffix}`;

  await loginAs(page, "admin");
  await page.goto("/fabrics/new");
  await fillFabricBasics(page, article, `API order ${suffix}`);
  await page.locator('input[type="file"][multiple]').setInputFiles([
    { name: "one.png", mimeType: "image/png", buffer: png },
    { name: "two.png", mimeType: "image/png", buffer: png },
  ]);
  await page.getByRole("button", { name: "Сохранить ткань" }).click();
  await expect(page).toHaveURL(/\/fabrics\/[0-9a-f-]{36}$/);
  const fabricId = page.url().split("/").pop()!;

  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");

  const fabricResponse = await request.get(`/api/v1/fabrics/${fabricId}`, {
    headers: { cookie: cookieHeader },
  });
  expect(fabricResponse.status()).toBe(200);
  const fabricPayload = await fabricResponse.json();
  const photoIds = (fabricPayload.data.assets as Array<{ id: string; type: string; sortOrder: number }>)
    .filter((asset) => asset.type === "photo")
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((asset) => asset.id);
  expect(photoIds).toHaveLength(2);

  const adminReorder = await request.patch(`/api/v1/fabrics/${fabricId}/assets`, {
    headers: { cookie: cookieHeader, "content-type": "application/json" },
    data: { items: [{ id: photoIds[1], sortOrder: 0 }, { id: photoIds[0], sortOrder: 1 }] },
  });
  expect(adminReorder.status()).toBe(200);

  await page.getByRole("button", { name: "Выйти" }).click();
  await expect(page).toHaveURL(/\/login/);
  await loginAs(page, "tailor");
  const tailorCookies = await page.context().cookies();
  const tailorHeader = tailorCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const tailorReorder = await request.patch(`/api/v1/fabrics/${fabricId}/assets`, {
    headers: { cookie: tailorHeader, "content-type": "application/json" },
    data: { items: [{ id: photoIds[0], sortOrder: 0 }, { id: photoIds[1], sortOrder: 1 }] },
  });
  expect(tailorReorder.status()).toBe(200);

  await page.getByRole("button", { name: "Выйти" }).click();
  await expect(page).toHaveURL(/\/login/);
  await loginAs(page, "employee");
  const employeeCookies = await page.context().cookies();
  const employeeHeader = employeeCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const employeeReorder = await request.patch(`/api/v1/fabrics/${fabricId}/assets`, {
    headers: { cookie: employeeHeader, "content-type": "application/json" },
    data: { items: [{ id: photoIds[1], sortOrder: 0 }, { id: photoIds[0], sortOrder: 1 }] },
  });
  expect(employeeReorder.status()).toBe(403);
  await expect(employeeReorder.json()).resolves.toMatchObject({ error: { code: "forbidden" } });
});
