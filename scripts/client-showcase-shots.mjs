/**
 * Client-ready showcase screenshots for Portnoy Atelier.
 * Usage: node scripts/client-showcase-shots.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const BASE = process.env.PORTNOY_BASE_URL || "http://localhost:3000";
const OUT = path.resolve("artifacts/client-showcase");
const EMAIL = "admin@portnoy.demo";
const PASSWORD = "atelier2026";

fs.mkdirSync(OUT, { recursive: true });

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator("#email").fill(EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/dashboard", { timeout: 25000 });
  await page.waitForTimeout(500);
}

async function settle(page, ms = 800) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, type: "png" });
  console.log("saved", path.relative(process.cwd(), file));
}

async function waitForSuit(page) {
  const stage = page.locator('[aria-label="Интерактивный 3D просмотрщик костюма"]');
  await stage.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForResponse(
    (response) => response.url().includes("suit-web-v2.glb") && response.ok(),
    { timeout: 60000 },
  ).catch(() => {});
  // Give R3F time to dress meshes after the 33MB GLB arrives.
  await page.waitForTimeout(6500);
  await page.getByRole("button", { name: /3\/4|Спереди/i }).first().waitFor({ state: "visible" }).catch(() => {});
}

async function captureSet(browser, label, contextOptions) {
  const context = await browser.newContext({
    ...contextOptions,
    deviceScaleFactor: contextOptions.deviceScaleFactor ?? 2,
    locale: "ru-RU",
    colorScheme: "light",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  await login(page);

  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await settle(page, 1200);
  await shot(page, `${label}-01-dashboard`);

  await page.goto(`${BASE}/fabrics`, { waitUntil: "domcontentloaded" });
  await settle(page, 1000);
  await shot(page, `${label}-02-fabrics-catalog`);

  await page.goto(`${BASE}/fabrics/f1`, { waitUntil: "domcontentloaded" });
  await settle(page, 1200);
  await page.locator(".fabric-dossier, .fabric-dossier__grid").first().waitFor({ state: "visible" });
  await shot(page, `${label}-03-fabric-detail`);

  await page.goto(`${BASE}/fabrics/import`, { waitUntil: "domcontentloaded" });
  await settle(page, 800);
  await shot(page, `${label}-08-fabric-import`);

  await page.goto(`${BASE}/configurator`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "3D студия" }).click().catch(() => {});
  const fabricChoice = page.getByRole("button", { name: /Prince of Wales|LP-0772|Olive Solaro|Brown Chalk/i }).first();
  if (await fabricChoice.count()) {
    await fabricChoice.click();
  } else {
    const fallback = page.locator(".fabric-picker-grid button").nth(1);
    if (await fallback.count()) await fallback.click();
  }
  await waitForSuit(page);
  await shot(page, `${label}-04-configurator-3d`);

  await page.getByRole("button", { name: /2D чертёж/i }).click();
  await settle(page, 1200);
  await shot(page, `${label}-05-configurator-2d`);

  await page.goto(`${BASE}/configurations`, { waitUntil: "domcontentloaded" });
  await settle(page, 1000);
  await shot(page, `${label}-06-configurations`);

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await settle(page, 700);
  await shot(page, `${label}-07-login`);

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  await captureSet(browser, "desktop", {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await captureSet(browser, "ipad", {
    ...devices["iPad Pro 11"],
    viewport: { width: 1194, height: 834 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  await browser.close();

  const readme = `# Portnoy — витрина для заказчика

Снято с \`${BASE}\` (demo).

## Desktop
- \`desktop-01-dashboard.png\` — рабочий стол
- \`desktop-02-fabrics-catalog.png\` — каталог тканей
- \`desktop-03-fabric-detail.png\` — карточка ткани
- \`desktop-08-fabric-import.png\` — импорт
- \`desktop-04-configurator-3d.png\` — 3D конфигуратор
- \`desktop-05-configurator-2d.png\` — 2D чертёж
- \`desktop-06-configurations.png\` — варианты
- \`desktop-07-login.png\` — вход

## iPad
Те же экраны с префиксом \`ipad-\`.

Демо: \`admin@portnoy.demo\` / \`atelier2026\`
`;
  fs.writeFileSync(path.join(OUT, "README.md"), readme, "utf8");
  console.log("done →", OUT);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
