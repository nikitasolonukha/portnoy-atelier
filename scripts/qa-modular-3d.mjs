import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const out = path.resolve("artifacts/modular-3d");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

try {
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.locator("#email").fill("admin@portnoy.demo");
  await page.locator("#password").fill("atelier2026");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/dashboard", { timeout: 20000 }).catch(() => {});

  await page.goto("http://localhost:3000/configurator", { waitUntil: "networkidle" });

  // Prefer a mid-tone fabric so silhouette QA is readable on dark stage.
  const fabricCard = page.getByRole("button", { name: /Fox|HL-|LP-|DR-|Camel|Grey|Gray|Navy(?! Midnight)/i }).first();
  if (await fabricCard.count()) {
    await fabricCard.click();
    await page.waitForTimeout(400);
  }

  await page.getByRole("button", { name: "3D студия" }).click();

  const stage = page.locator('[aria-label="Интерактивный 3D просмотрщик костюма"]');
  await stage.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(4500);
  await page.getByRole("button", { name: "Спереди" }).click().catch(() => {});
  await page.waitForTimeout(800);
  await stage.screenshot({ path: path.join(out, "01-single-notch.png") });
  console.log("saved 01-single-notch.png");

  // Step nav uses "02 Jacket" style; options are Russian labels / value buttons.
  await page.getByRole("button", { name: /Jacket/i }).first().click();
  await page.waitForTimeout(400);
  const doubleBtn = page.getByRole("button", { name: /Двубортный|double/i }).first();
  await doubleBtn.click();
  await page.waitForTimeout(3500);
  await stage.screenshot({ path: path.join(out, "02-double-peak.png") });
  console.log("saved 02-double-peak.png");

  await page.getByRole("button", { name: /Waistcoat/i }).first().click();
  await page.waitForTimeout(400);
  // Prefer single vest over none; click the single option.
  const vestSingle = page.getByRole("button", { name: /Однобортный|single/i }).first();
  await vestSingle.click();
  await page.waitForTimeout(3500);
  await stage.screenshot({ path: path.join(out, "03-vest-single.png") });
  console.log("saved 03-vest-single.png");

  // Also capture 3/4 for silhouette QA.
  await page.getByRole("button", { name: /3\/4/ }).click().catch(() => {});
  await page.waitForTimeout(800);
  await stage.screenshot({ path: path.join(out, "04-vest-three-quarter.png") });
  console.log("saved 04-vest-three-quarter.png");

  console.log("done", fs.readdirSync(out));
} catch (error) {
  const shot = path.join(out, "error.png");
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
  console.error("QA failed:", error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
