import { expect, type Page } from "@playwright/test";
import { roleFixtures } from "./fixtures";

export async function loginAs(page: Page, role: keyof typeof roleFixtures) {
  const fixture = roleFixtures[role];
  await page.goto("/login");
  await page.getByLabel("Email").fill(fixture.email);
  await page.locator("#password").fill(fixture.password);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(fixture.fullName, { exact: true })).toBeVisible();
}

export async function goToSummary(page: Page) {
  for (let index = 0; index < 6; index += 1) await page.getByRole("button", { name: "Далее" }).click();
}

export const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2+L8AAAAASUVORK5CYII=", "base64");
