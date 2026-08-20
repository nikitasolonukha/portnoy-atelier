import path from "node:path";
import fs from "node:fs";
import { chromium, devices } from "@playwright/test";

const BASE = process.env.PORTNOY_BASE_URL || "http://localhost:3000";
const OUT = path.resolve("artifacts/premium-color-pass");
fs.mkdirSync(OUT, { recursive: true });

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator("#email").fill("admin@portnoy.demo");
  await page.locator("#password").fill("atelier2026");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/dashboard", { timeout: 25000 });
}

async function shot(page, name) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log("saved", name);
}

async function run(browser, label, opts) {
  const context = await browser.newContext({ ...opts, locale: "ru-RU" });
  const page = await context.newPage();
  await login(page);

  await page.goto(`${BASE}/dashboard`);
  await shot(page, `${label}-01-dashboard`);

  await page.goto(`${BASE}/fabrics`);
  await shot(page, `${label}-02-catalog`);

  await page.goto(`${BASE}/fabrics/f1`);
  await page.locator(".fabric-dossier").waitFor({ state: "visible" });
  await shot(page, `${label}-03-fabric-detail`);

  await page.goto(`${BASE}/configurator`);
  await page.getByRole("button", { name: "3D студия" }).click().catch(() => {});
  const fabric = page.getByRole("button", { name: /Prince of Wales|LP-0772/i }).first();
  if (await fabric.count()) await fabric.click();
  await page.waitForTimeout(5500);
  await shot(page, `${label}-04-configurator`);

  await page.goto(`${BASE}/configurations/compare?left=c1&right=c2`).catch(() => {});
  // Prefer known demo ids if present; otherwise list page
  const compareOk = await page.locator("text=Сравнение").count();
  if (!compareOk) {
    await page.goto(`${BASE}/configurations`);
    await shot(page, `${label}-05-configurations`);
  } else {
    await shot(page, `${label}-05-compare`);
  }

  await context.close();
}

const browser = await chromium.launch({ headless: true });
await run(browser, "desktop", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await run(browser, "ipad", {
  ...devices["iPad Pro 11"],
  viewport: { width: 1194, height: 834 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
await browser.close();

fs.writeFileSync(
  path.join(OUT, "README.md"),
  `# Premium color + typography pass\n\nWarm ivory / graphite / oxblood + Prata / Manrope.\n`,
  "utf8",
);
console.log("done →", OUT);
