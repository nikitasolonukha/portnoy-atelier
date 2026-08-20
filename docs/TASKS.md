# Progress

## Stage 1 core complete

- [x] Next.js 16.3.1 / React 19 / strict TypeScript / Tailwind 4 / pnpm lockfile.
- [x] Authenticated responsive workspace, full fabric lifecycle, XLS/XLSX/CSV import, data-driven configurator with 2D/3D preview, save/duplicate/compare.
- [x] Bounded fabric pagination contract and controlled all-page hydration verified with 250 rows.
- [x] Patch-safe import updates preserve unmapped fields; mapped blank text explicitly clears.
- [x] Active-profile RLS covers business tables and private Storage; inactive JWT sessions lose access.
- [x] UI permissions align with backend ownership and roles; ordinary configurator hides inactive groups/options.
- [x] Unit/integration/coverage, demo E2E, real-Supabase responsive E2E, clean reset, pgTAP and generated types are green locally.
- [x] Cursor/Claude/Codex handoff rules and skills are versioned.

## Visual redesign V3 (editorial atelier)

- [x] `docs/DESIGN_SYSTEM_V3.md` — tokens, composition rules, forbidden admin-panel patterns.
- [x] Pass 1–9: icon-rail shell, editorial dashboard, material-first catalog, dossier detail/form, import steps, MaterialStage configurator (no CSS mannequin), saved-looks list, A/B compare, iPad layouts.
- [x] New components: `FabricMedia`, `MaterialStage`, `fabric-visual` helpers.
- [x] Browser visual QA on Docker `:3107` — screenshots in `artifacts/v3/` (desktop + iPad landscape for dashboard, catalog, configurator).
- [x] Local verification: `pnpm typecheck`, `pnpm lint`, `pnpm test:coverage` (62 tests, ≥80% gates).

## Visual redesign V4 (digital luxury polish)

- [x] V4 tokens: clean warm neutral canvas, premium graphite, colder accent, steel neutrals, radius + depth system.
- [x] Typography: Instrument Serif (display ~20%) + Manrope (UI ~80%).
- [x] First pass: dashboard, catalog, configurator (iPad landscape QA in `artifacts/v4/`).
- [x] Rollout: configurations list/compare, fabric detail/form, import wizard, login, empty states.
- [x] Docker rebuild on `:3107`.

## Visual polish V5 (premium color + typography)

- [x] Color tokens: warm ivory canvas `#F6F3EE` / surface `#FBF8F3`, graphite `#1B1C1A`, oxblood accent `#6A2030`, stone/taupe neutrals; no product blue.
- [x] Typography: Prata (display ~15–20%, Cyrillic via `next/font`) + Manrope 400/500/600 (UI ~80–85%).
- [x] Roles: page/section/material titles → Prata; sidebar/buttons/forms/filters/metadata → Manrope; configurator step title → Manrope.
- [x] QA screenshots: `artifacts/premium-color-pass/` (desktop + iPad landscape: dashboard, catalog, fabric detail, configurator, compare).

## Visual polish V6 (tonal composition)

- [x] Canvas deepened to warm stone `#E9E4DC`; surfaces ivory/warm (`#F5F1E9` / `#EFEAE2` / `#F2EEE7`); no UI `#FFFFFF` surfaces.
- [x] Graphite as product language beyond sidebar: dashboard hero+metrics, catalog filter rail, fabric dossier panel, configurator step header, compare Variant B, import hero, form media stage, selected configuration row.
- [x] Oxblood kept sparse (CTA / selected / active marker); bronze micro only.
- [x] Subtle global grain (~1.5% opacity) for paper/textile materiality.
- [x] QA: `artifacts/premium-tonal-pass/` (desktop dashboard/catalog/configurator; iPad + fabric detail; palette swatches).

## Atelier zip integration (3D configurator)

- [x] Extracted `portnoy-atelier (2).zip` to `.tmp-portnoy-import/` (Vite prototype reference).
- [x] Ported `src/features/three/**` (R3F viewer, GLB suit, procedural fabrics, camera presets).
- [x] Assets: `public/models/suit-web-v2.glb`, `public/textures/fabrics/generated/*`.
- [x] Replace corrupted `suit-web-v2.glb` with clean Sketchfab `man_black_business_suit.glb` (33 MB, header valid).
- [x] Enhanced `MaterialStage` with settings-driven technical SVG (lapel/pocket/jacket variants).
- [x] Configurator 2D/3D toggle: `Suit3DStage` (dynamic, SSR off) + `MaterialStage`.
- [x] Deps: `three`, `@react-three/fiber`, `@react-three/drei`; CSP `worker-src blob:` + HDR connect-src.
- [x] Docs: `docs/3D_ASSET_SPEC.md`, `docs/3D_MODEL_AUDIT.md`, `docs/FABRIC_ASSET_AUDIT.md`.
- [x] Removed procedural overlays — visually unacceptable on the baked Sketchfab mesh; construction variants stay in 2D until a modular GLB exists.
- [x] Frame the GLB in the inset 3D viewer: camera looks at figure center (`SUIT_STAGE.centerY`), full-height distance, XZ centering.
- [x] Tablet configurator layout: two-pane from 1024px (stage + panel), horizontal steps, uncrushable stage column.
- [x] Modular suit v3 pipeline exists, but **broken double donor is disabled in runtime**. 3D studio uses `suit-web-v2.glb` (fabric + silhouette). Jacket/lapel/buttons/pockets/vest construction is authoritative on **2D чертёж** until phase-2 real mesh variants exist. Overlay states this explicitly.
- [x] Phase-1 visual QA artifacts in `artifacts/modular-3d/`. Do not claim modular double/lapel/button swaps work in 3D.

## Fabric import photos (demo)

- [x] Demo import now builds `assets` from `imageUrl` (was dropped; swatch forced to charcoal).
- [x] Persist migrate v3 attaches `/fabrics/import-pack/*` for known articles already in localStorage.
- [x] Import pack photo column uses relative `/fabrics/import-pack/...` paths.
- [x] 3D jacket uses catalog photo (not only `texture` assets); shared material + lower photo repeat so fabrics stay distinct.
- [x] Configurator/responsive density: smaller titles, denser fabric grid, desktop split fills viewport without oversized swatches.
- [x] Dashboard desktop: replace fragile `xl:grid-cols-12` split with explicit two-column board (no center void); denser materials grid.
- [x] Client showcase screenshots in `artifacts/client-showcase/` (desktop + iPad): dashboard, catalog, detail, 3D/2D configurator, configurations, login.
- [x] Showcase polish: DEMO label removed; fabric dossier fits viewport; 3D overlay cleaned; iPad dashboard stacked; screenshots retaken.

## External activation checklist

- [x] `fix/final-stage-one-hardening` pushed; draft PR [#7](https://github.com/nikitasolonukha/portnoy-atelier/pull/7) targets `main`.
- [ ] Obtain green GitHub Actions evidence for quality, demo E2E and Supabase jobs on the final HEAD.
- [ ] Create/link staging Supabase and populate secrets outside git.
- [ ] Apply migrations and repeat admin/tailor/employee browser + direct RLS matrix on staging.
- [ ] Create staging deployment and attach staging URL.
- [ ] Verify backup/restore and record release/rollback owner.
- [ ] Configure production observability, alert destination and incident owner.

Do not mark an external item complete from local code inspection alone.
