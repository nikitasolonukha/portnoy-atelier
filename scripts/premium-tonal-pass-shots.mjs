import path from "node:path";
import fs from "node:fs";
import { chromium, devices } from "@playwright/test";

const BASE = process.env.PORTNOY_BASE_URL || "http://localhost:3000";
const OUT = path.resolve("artifacts/premium-tonal-pass");
fs.mkdirSync(OUT, { recursive: true });

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator("#email").fill("admin@portnoy.demo");
  await page.locator("#password").fill("atelier2026");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/dashboard", { timeout: 25000 });
}

async function shot(page, name) {
  await page.waitForTimeout(800);
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

  await page.goto(`${BASE}/configurator`);
  await page.getByRole("button", { name: "3D студия" }).click().catch(() => {});
  const fabric = page.getByRole("button", { name: /Prince of Wales|LP-0772/i }).first();
  if (await fabric.count()) await fabric.click();
  await page.waitForTimeout(1200);
  await shot(page, `${label}-03-configurator`);

  if (label === "ipad") {
    await page.goto(`${BASE}/fabrics/f1`);
    await page.locator(".fabric-dossier").waitFor({ state: "visible" });
    await shot(page, `${label}-04-fabric-detail`);
  }

  await context.close();
}

const browser = await chromium.launch({ headless: true });
await run(browser, "desktop", { viewport: { width: 1440, height: 900 } });
await run(browser, "ipad", { ...devices["iPad Pro 11 landscape"] });

// palette swatches page
const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
const page = await context.newPage();
await page.setContent(`<!doctype html><html><body style="margin:0;font-family:system-ui;background:#E9E4DC;padding:32px">
<h1 style="margin:0 0 24px;font-size:28px">Portnoy V6 tonal swatches</h1>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">
${[
  ["CANVAS","#E9E4DC"],["CANVAS DEEP","#DDD6CC"],["IVORY","#F5F1E9"],["SURFACE","#EFEAE2"],["SURFACE LIGHT","#F8F4ED"],
  ["GRAPHITE","#191B19"],["GRAPHITE ELEV","#222421"],["GRAPHITE SOFT","#2A2D29"],["OXBLOOD","#681C30"],["OXBLOOD DARK","#501322"],
  ["OXBLOOD SOFT","#E9DADC"],["TAUPE","#A89C8D"],["BRONZE","#8C7151"],["BORDER","#D1C9BE"],["TEXT","#181917"]
].map(([n,c])=>`<div><div style="height:72px;border-radius:12px;background:${c};border:1px solid #C4BBB0"></div><p style="margin:8px 0 0;font-size:11px;letter-spacing:.08em">${n}<br>${c}</p></div>`).join("")}
</div></body></html>`);
await page.screenshot({ path: path.join(OUT, "palette-swatches.png") });
console.log("saved palette-swatches");
await context.close();
await browser.close();
console.log("done →", OUT);
