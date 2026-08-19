import { expect, test } from "@playwright/test";
import { authenticatedClient, loginAs, serviceClient } from "./helpers";

test("250 fabrics remain reachable through pagination, search and the configurator selector", async ({ page }) => {
  test.setTimeout(90_000);
  const service = serviceClient();
  const admin = await authenticatedClient("admin");
  const suffix = Date.now();
  const prefix = `E2E-LARGE-${suffix}`;
  const targetArticle = `${prefix}-230`;
  const targetName = `Large catalog target ${suffix}`;
  const baseTime = Date.now();
  const rows = Array.from({ length: 250 }, (_, index) => ({
    article: `${prefix}-${String(index + 1).padStart(3, "0")}`,
    name: index === 229 ? targetName : `Large catalog fabric ${suffix}-${index + 1}`,
    manufacturer: "Pagination Mill",
    is_active: true,
    updated_at: new Date(baseTime - index * 1_000).toISOString(),
  }));
  const { data: inserted, error } = await admin.from("fabrics").insert(rows).select("id,article");
  if (error) throw error;
  const target = inserted.find((item) => item.article === targetArticle);
  if (!target) throw new Error("Large catalog target fixture was not created");

  try {
    await loginAs(page, "admin");
    const pages = await page.evaluate(async (article) => {
      const firstResponse = await fetch("/api/v1/fabrics?status=all&page=1&limit=200");
      const secondResponse = await fetch("/api/v1/fabrics?status=all&page=2&limit=200");
      const searchResponse = await fetch(`/api/v1/fabrics?status=all&q=${encodeURIComponent(article)}&page=1&limit=200`);
      const first = await firstResponse.json();
      const second = await secondResponse.json();
      const search = await searchResponse.json();
      return { first, second, search };
    }, targetArticle);
    expect(pages.first.meta.total).toBeGreaterThanOrEqual(250);
    expect(pages.first.meta.hasMore).toBe(true);
    expect(pages.first.data.some((item: { article: string }) => item.article === targetArticle)).toBe(false);
    expect(pages.second.data.some((item: { article: string }) => item.article === targetArticle)).toBe(true);
    expect(pages.search.data).toEqual([expect.objectContaining({ article: targetArticle, name: targetName })]);

    await page.goto("/fabrics");
    await page.getByLabel("Поиск тканей").fill(targetArticle);
    await expect(page.getByRole("link").filter({ has: page.getByRole("heading", { name: targetName, exact: true }) })).toBeVisible();

    await page.goto(`/configurator?fabric=${target.id}`);
    await expect(page.getByRole("button", { name: new RegExp(targetName) })).toBeVisible();
  } finally {
    await service.from("fabrics").delete().like("article", `${prefix}%`);
  }
});