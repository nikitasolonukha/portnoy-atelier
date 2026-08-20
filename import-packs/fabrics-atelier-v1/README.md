# Пакет импорта тканей — Portnoy Atelier v1

## Что внутри
- `fabrics-import.xlsx` / `fabrics-import.csv` — таблица под импорт (`/fabrics/import`)
- `photos/` — фото/свотчи тканей
- Копии в `public/fabrics/import-pack/` для URL `http://localhost:3000/fabrics/import-pack/...`

## How to import
1. `pnpm dev`
2. Login: `admin@portnoy.demo` / `atelier2026`
3. **Ткани → Импорт** → `import-packs/fabrics-atelier-v1/fabrics-import.xlsx`
4. Map columns (Артикул, Название, …, **Фото → imageUrl**)
5. Import with strategy **update** if fabrics already exist without photos

If `fabrics-import.xlsx` is open in Excel and locked, use `fabrics-import-v2.xlsx` or the CSV.

Demo mode attaches `assets` from `imageUrl` on create/update. Refresh the catalog after import; persisted demo workspace migrates missing pack photos for known articles automatically.

## Sources
- Swatches VB/LP/DR/AR/RE/HM/SC/DR-6611 — generated atelier swatches
- UN-1001, UN-1002 — Unsplash License (see credits in the table)

Photo URLs in the table are app-relative: `/fabrics/import-pack/<file>`.

