import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

const ROOT = process.cwd();
const PACK = path.join(ROOT, "import-packs", "fabrics-atelier-v1");
const PHOTOS = path.join(PACK, "photos");
const PUBLIC = path.join(ROOT, "public", "fabrics", "import-pack");

fs.mkdirSync(PHOTOS, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

/** Catalog rows: atelier-style articles with local photo filenames. */
const FABRICS = [
  {
    article: "VB-9101",
    name: "Midnight Hopsack",
    manufacturer: "Vitale Barberis Canonico",
    collection: "Perennial",
    composition: "100% шерсть",
    mainColor: "Синий",
    pattern: "Однотонная",
    weightGsm: 280,
    widthCm: 150,
    pricePerMeter: 12800,
    currency: "RUB",
    description: "Сухая hopsack-фактура, тёмно-синий тон для круглогодичного костюма.",
    file: "VB-9101-midnight-hopsack.png",
    kind: "navy-weave",
    source: "generated-swatch",
  },
  {
    article: "LP-8810",
    name: "Prince of Wales",
    manufacturer: "Loro Piana",
    collection: "Australis",
    composition: "100% шерсть Super 150’s",
    mainColor: "Серый",
    pattern: "Клетка",
    weightGsm: 250,
    widthCm: 150,
    pricePerMeter: 29600,
    currency: "RUB",
    description: "Серая клетка с бордовой оконной линией.",
    file: "LP-8810-prince-of-wales.png",
    kind: "grey-check",
    source: "generated-swatch",
  },
  {
    article: "DR-5502",
    name: "Charcoal Flannel",
    manufacturer: "Drapers",
    collection: "Lady Sanfelice",
    composition: "100% шерсть",
    mainColor: "Графит",
    pattern: "Меланж",
    weightGsm: 340,
    widthCm: 150,
    pricePerMeter: 17400,
    currency: "RUB",
    description: "Плотная матовая фланель для холодного сезона.",
    file: "DR-5502-charcoal-flannel.png",
    kind: "charcoal",
    source: "generated-swatch",
  },
  {
    article: "AR-7204",
    name: "Olive Solaro",
    manufacturer: "Ariston",
    collection: "Season",
    composition: "100% шерсть",
    mainColor: "Оливковый",
    pattern: "Диагональ",
    weightGsm: 270,
    widthCm: 150,
    pricePerMeter: 21900,
    currency: "RUB",
    description: "Переливчатая оливковая диагональ Solaro.",
    file: "AR-7204-olive-solaro.png",
    kind: "olive-twill",
    source: "generated-swatch",
  },
  {
    article: "RE-3408",
    name: "Brown Chalk Stripe",
    manufacturer: "Reda",
    collection: "1865",
    composition: "100% шерсть",
    mainColor: "Коричневый",
    pattern: "Полоска",
    weightGsm: 290,
    widthCm: 150,
    pricePerMeter: 14600,
    currency: "RUB",
    description: "Коричневая основа и тонкая меловая полоска.",
    file: "RE-3408-brown-chalk-stripe.png",
    kind: "brown-stripe",
    source: "generated-swatch",
  },
  {
    article: "HM-2103",
    name: "Navy Birdseye",
    manufacturer: "Holland & Sherry",
    collection: "City",
    composition: "100% шерсть",
    mainColor: "Синий",
    pattern: "Меланж",
    weightGsm: 300,
    widthCm: 150,
    pricePerMeter: 18900,
    currency: "RUB",
    description: "Мелкоузорчатый birdseye в тёмно-синем тоне.",
    file: "HM-2103-navy-birdseye.png",
    kind: "birdseye",
    source: "generated-swatch",
  },
  {
    article: "SC-1188",
    name: "Mid Grey Herringbone",
    manufacturer: "Scabal",
    collection: "Heritage",
    composition: "100% шерсть",
    mainColor: "Серый",
    pattern: "Ёлочка",
    weightGsm: 310,
    widthCm: 150,
    pricePerMeter: 22400,
    currency: "RUB",
    description: "Классическая серая ёлочка для делового костюма.",
    file: "SC-1188-mid-grey-herringbone.png",
    kind: "herringbone",
    source: "generated-swatch",
  },
  {
    article: "DR-6611",
    name: "Black Super 120s",
    manufacturer: "Dormeuil",
    collection: "Amadeus",
    composition: "100% шерсть Super 120’s",
    mainColor: "Чёрный",
    pattern: "Однотонная",
    weightGsm: 260,
    widthCm: 150,
    pricePerMeter: 26800,
    currency: "RUB",
    description: "Глубокий чёрный Super 120’s с мягким блеском.",
    file: "DR-6611-black-super120.png",
    kind: "black",
    source: "generated-swatch",
  },
  {
    article: "UN-1001",
    name: "Woven Brown Wool",
    manufacturer: "Atelier Sample",
    collection: "Unsplash Reference",
    composition: "100% шерсть",
    mainColor: "Коричневый",
    pattern: "Однотонная",
    weightGsm: 320,
    widthCm: 150,
    pricePerMeter: 9900,
    currency: "RUB",
    description: "Референсное фото переплетения (Unsplash License).",
    file: "UN-1001-woven-brown.jpg",
    kind: "unsplash",
    unsplash: "https://images.unsplash.com/photo-1748792311943-7b654e3a9c8e?auto=format&fit=crop&w=1200&q=80",
    credit: "Marek Levák / Unsplash",
    source: "unsplash",
  },
  {
    article: "UN-1002",
    name: "Dark Grey Texture",
    manufacturer: "Atelier Sample",
    collection: "Unsplash Reference",
    composition: "100% шерсть",
    mainColor: "Графит",
    pattern: "Однотонная",
    weightGsm: 300,
    widthCm: 150,
    pricePerMeter: 8900,
    currency: "RUB",
    description: "Тёмно-серая текстура поверхности (Unsplash License).",
    file: "UN-1002-dark-grey.jpg",
    kind: "unsplash",
    unsplash: "https://images.unsplash.com/photo-1759185301753-e63dd521c597?auto=format&fit=crop&w=1200&q=80",
    credit: "Unsplash",
    source: "unsplash",
  },
];

function drawKind(ctx, s, kind) {
  if (kind === "navy-weave") {
    const g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, "#152536");
    g.addColorStop(0.4, "#1e3450");
    g.addColorStop(1, "#0f1a28");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      for (let x = 0; x < s; x += 2) {
        ctx.fillStyle = (x / 2 + y / 2) % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
        ctx.fillRect(x, y, 2, 2);
      }
    }
    return;
  }
  if (kind === "grey-check") {
    ctx.fillStyle = "#6f716c";
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      for (let x = 0; x < s; x += 2) {
        ctx.fillStyle = (x + y) % 4 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
        ctx.fillRect(x, y, 2, 2);
      }
    }
    const tile = 64;
    for (let x = 0; x < s; x += tile) {
      ctx.fillStyle = "rgba(86,28,38,0.75)";
      ctx.fillRect(x + tile * 0.47, 0, Math.max(2, tile * 0.04), s);
    }
    for (let y = 0; y < s; y += tile) {
      ctx.fillStyle = "rgba(34,35,33,0.5)";
      ctx.fillRect(0, y + tile * 0.47, s, Math.max(2, tile * 0.04));
    }
    for (let x = 0; x < s; x += tile / 2) {
      ctx.fillStyle = "rgba(40,42,40,0.22)";
      ctx.fillRect(x + tile * 0.22, 0, 1, s);
    }
    for (let y = 0; y < s; y += tile / 2) {
      ctx.fillStyle = "rgba(40,42,40,0.22)";
      ctx.fillRect(0, y + tile * 0.22, s, 1);
    }
    return;
  }
  if (kind === "charcoal") {
    const g = ctx.createLinearGradient(0, 0, s, s * 0.8);
    g.addColorStop(0, "#2f302e");
    g.addColorStop(0.42, "#4a4b48");
    g.addColorStop(1, "#222322");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 14000; i += 1) {
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
      ctx.fillRect(Math.random() * s, Math.random() * s, 1.5, 1.5);
    }
    return;
  }
  if (kind === "olive-twill") {
    ctx.fillStyle = "#565840";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1.2;
    for (let i = -s; i < s * 2; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + s * 0.7, s);
      ctx.stroke();
    }
    return;
  }
  if (kind === "brown-stripe") {
    ctx.fillStyle = "#4f3f36";
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      for (let x = 0; x < s; x += 2) {
        ctx.fillStyle = (x + y) % 4 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
        ctx.fillRect(x, y, 2, 2);
      }
    }
    for (let x = 32; x < s; x += 68) {
      ctx.fillStyle = "rgba(235,222,201,0.55)";
      ctx.fillRect(x, 0, 3, s);
    }
    return;
  }
  if (kind === "birdseye") {
    ctx.fillStyle = "#1a2436";
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 6) {
      for (let x = 0; x < s; x += 6) {
        ctx.fillStyle = "rgba(180,190,210,0.18)";
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return;
  }
  if (kind === "herringbone") {
    ctx.fillStyle = "#5c6066";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    const z = 16;
    for (let x = 0; x < s; x += z) {
      ctx.beginPath();
      for (let y = 0; y < s; y += z) {
        if (((y / z) | 0) % 2 === 0) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + z, y + z);
        } else {
          ctx.moveTo(x + z, y);
          ctx.lineTo(x, y + z);
        }
      }
      ctx.stroke();
    }
    return;
  }
  if (kind === "black") {
    const g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, "#141414");
    g.addColorStop(0.5, "#2a2a2a");
    g.addColorStop(1, "#0e0e0e");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      for (let x = 0; x < s; x += 2) {
        ctx.fillStyle = (x / 2 + y / 2) % 2 === 0 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.04)";
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
}

async function downloadUnsplash(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "PortnoyAtelierImportPack/1.0" } });
  if (!res.ok) throw new Error(`download failed ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });

  for (const fabric of FABRICS) {
    const dest = path.join(PHOTOS, fabric.file);
    if (fabric.unsplash) {
      if (!fs.existsSync(dest)) {
        console.log("download", fabric.article);
        await downloadUnsplash(fabric.unsplash, dest);
      } else {
        console.log("skip download", fabric.article);
      }
    } else if (!fs.existsSync(dest)) {
      await page.setContent("<canvas id='c' width='1024' height='1024'></canvas>");
      await page.evaluate(
        ({ kind }) => {
          const canvas = document.getElementById("c");
          const ctx = canvas.getContext("2d");
          const s = 1024;
          // inlined draw via Function body from node is hard; call global
          window.__draw = null;
        },
        { kind: fabric.kind },
      );
      await page.evaluate((kind) => {
        const canvas = document.getElementById("c");
        const ctx = canvas.getContext("2d");
        const s = 1024;
        const draw = (k) => {
          if (k === "navy-weave") {
            const g = ctx.createLinearGradient(0, 0, s, s);
            g.addColorStop(0, "#152536");
            g.addColorStop(0.4, "#1e3450");
            g.addColorStop(1, "#0f1a28");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, s, s);
            for (let y = 0; y < s; y += 2) for (let x = 0; x < s; x += 2) {
              ctx.fillStyle = (x / 2 + y / 2) % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
              ctx.fillRect(x, y, 2, 2);
            }
          } else if (k === "grey-check") {
            ctx.fillStyle = "#6f716c";
            ctx.fillRect(0, 0, s, s);
            const tile = 64;
            for (let x = 0; x < s; x += tile) {
              ctx.fillStyle = "rgba(86,28,38,0.75)";
              ctx.fillRect(x + tile * 0.47, 0, Math.max(2, tile * 0.04), s);
            }
            for (let y = 0; y < s; y += tile) {
              ctx.fillStyle = "rgba(34,35,33,0.5)";
              ctx.fillRect(0, y + tile * 0.47, s, Math.max(2, tile * 0.04));
            }
            for (let x = 0; x < s; x += tile / 2) ctx.fillRect(x + tile * 0.22, 0, 1, s);
            for (let y = 0; y < s; y += tile / 2) {
              ctx.fillStyle = "rgba(40,42,40,0.22)";
              ctx.fillRect(0, y + tile * 0.22, s, 1);
            }
          } else if (k === "charcoal") {
            const g = ctx.createLinearGradient(0, 0, s, s * 0.8);
            g.addColorStop(0, "#2f302e");
            g.addColorStop(0.42, "#4a4b48");
            g.addColorStop(1, "#222322");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, s, s);
            for (let i = 0; i < 14000; i++) {
              ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
              ctx.fillRect(Math.random() * s, Math.random() * s, 1.5, 1.5);
            }
          } else if (k === "olive-twill") {
            ctx.fillStyle = "#565840";
            ctx.fillRect(0, 0, s, s);
            ctx.strokeStyle = "rgba(255,255,255,0.14)";
            ctx.lineWidth = 1.2;
            for (let i = -s; i < s * 2; i += 4) {
              ctx.beginPath();
              ctx.moveTo(i, 0);
              ctx.lineTo(i + s * 0.7, s);
              ctx.stroke();
            }
          } else if (k === "brown-stripe") {
            ctx.fillStyle = "#4f3f36";
            ctx.fillRect(0, 0, s, s);
            for (let x = 32; x < s; x += 68) {
              ctx.fillStyle = "rgba(235,222,201,0.55)";
              ctx.fillRect(x, 0, 3, s);
            }
          } else if (k === "birdseye") {
            ctx.fillStyle = "#1a2436";
            ctx.fillRect(0, 0, s, s);
            for (let y = 0; y < s; y += 6) for (let x = 0; x < s; x += 6) {
              ctx.fillStyle = "rgba(180,190,210,0.18)";
              ctx.beginPath();
              ctx.arc(x + 2, y + 2, 1.1, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (k === "herringbone") {
            ctx.fillStyle = "#5c6066";
            ctx.fillRect(0, 0, s, s);
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 1;
            const z = 16;
            for (let x = 0; x < s; x += z) {
              ctx.beginPath();
              for (let y = 0; y < s; y += z) {
                if (((y / z) | 0) % 2 === 0) {
                  ctx.moveTo(x, y);
                  ctx.lineTo(x + z, y + z);
                } else {
                  ctx.moveTo(x + z, y);
                  ctx.lineTo(x, y + z);
                }
              }
              ctx.stroke();
            }
          } else if (k === "black") {
            const g = ctx.createLinearGradient(0, 0, s, s);
            g.addColorStop(0, "#141414");
            g.addColorStop(0.5, "#2a2a2a");
            g.addColorStop(1, "#0e0e0e");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, s, s);
          }
        };
        draw(kind);
      }, fabric.kind);
      await page.locator("#c").screenshot({ path: dest, type: "png" });
    }
    fs.copyFileSync(dest, path.join(PUBLIC, fabric.file));
  }

  await browser.close();

  const rows = FABRICS.map((f) => ({
    Артикул: f.article,
    Название: f.name,
    Производитель: f.manufacturer,
    Коллекция: f.collection,
    Состав: f.composition,
    Цвет: f.mainColor,
    Рисунок: f.pattern,
    "Плотность": f.weightGsm,
    Ширина: f.widthCm,
    Цена: f.pricePerMeter,
    Валюта: f.currency,
    Описание: f.description,
    Фото: `/fabrics/import-pack/${f.file}`,
    "Файл фото": f.file,
    Источник: f.source,
    Кредит: f.credit || (f.source === "generated-swatch" ? "Portnoy Atelier swatch (original)" : ""),
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = [
    { wch: 12 }, { wch: 22 }, { wch: 24 }, { wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 12 },
    { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 48 }, { wch: 64 }, { wch: 36 }, { wch: 16 }, { wch: 28 },
  ];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Ткани");
  const xlsxPath = path.join(PACK, "fabrics-import.xlsx");
  const buf = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
  fs.writeFileSync(xlsxPath, buf);
  fs.writeFileSync(path.join(PACK, "fabrics-import.csv"), XLSX.utils.sheet_to_csv(sheet), "utf8");
  logReadme();
  console.log("Wrote", xlsxPath);
  console.log("Photos", fs.readdirSync(PHOTOS).length);
}

function logReadme() {
  const readme = `# Пакет импорта тканей — Portnoy Atelier v1

## Что внутри
- \`fabrics-import.xlsx\` / \`fabrics-import.csv\` — таблица под импорт (\`/fabrics/import\`)
- \`photos/\` — фото/свотчи тканей
- Копии в \`public/fabrics/import-pack/\` для URL \`/fabrics/import-pack/...\`

## Как импортировать
1. \`pnpm dev\`
2. Войти: \`admin@portnoy.demo\` / \`atelier2026\`
3. **Ткани → Импорт** → выбрать \`import-packs/fabrics-atelier-v1/fabrics-import.xlsx\`
4. Сопоставить колонки (Артикул, Название, …, **Фото → imageUrl**)
5. Импортировать со стратегией **update**, если ткани уже есть без фото

Demo-режим пишет \`assets\` из \`imageUrl\` при create/update. Колонка Фото — относительные пути \`/fabrics/import-pack/<file>\`.

## Источники
- Свотчи VB/LP/DR/AR/RE/HM/SC/DR-6611 — оригинальные (как в UI каталога)
- UN-1001, UN-1002 — Unsplash License (см. credits в таблице)
`;
  fs.writeFileSync(path.join(PACK, "README.md"), readme, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
