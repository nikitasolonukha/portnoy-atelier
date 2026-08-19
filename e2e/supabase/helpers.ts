import { createClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";
import { roleFixtures } from "./fixtures";

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Local Supabase service environment is required for isolated test fixtures");
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function authenticatedClient(role: keyof typeof roleFixtures) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Local Supabase browser environment is required for test fixtures");
  const client = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const fixture = roleFixtures[role];
  const { error } = await client.auth.signInWithPassword({ email: fixture.email, password: fixture.password });
  if (error) throw error;
  return client;
}

export async function loginAs(page: Page, role: keyof typeof roleFixtures) {
  const fixture = roleFixtures[role];
  await page.goto("/login");
  await page.getByLabel("Email").fill(fixture.email);
  await page.locator("#password").fill(fixture.password);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByLabel(`Текущий пользователь: ${fixture.fullName}`)).toBeVisible();
}

export async function goToSummary(page: Page) {
  for (let index = 0; index < 6; index += 1) await page.getByRole("button", { name: "Далее" }).click();
}

export const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2+L8AAAAASUVORK5CYII=", "base64");
