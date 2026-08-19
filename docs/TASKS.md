# Progress

## Stage 1 core complete

- [x] Next.js 16.3.1 / React 19 / strict TypeScript / Tailwind 4 / pnpm lockfile.
- [x] Authenticated responsive workspace, full fabric lifecycle, XLS/XLSX/CSV import, data-driven configurator, save/duplicate/compare; 3D excluded.
- [x] Bounded fabric pagination contract and controlled all-page hydration verified with 250 rows.
- [x] Patch-safe import updates preserve unmapped fields; mapped blank text explicitly clears.
- [x] Active-profile RLS covers business tables and private Storage; inactive JWT sessions lose access.
- [x] UI permissions align with backend ownership and roles; ordinary configurator hides inactive groups/options.
- [x] Unit/integration/coverage, demo E2E, real-Supabase responsive E2E, clean reset, pgTAP and generated types are green locally.
- [x] Cursor/Claude/Codex handoff rules and skills are versioned.

## External activation checklist

- [x] `fix/final-stage-one-hardening` pushed; draft PR [#7](https://github.com/nikitasolonukha/portnoy-atelier/pull/7) targets `main`.
- [ ] Obtain green GitHub Actions evidence for quality, demo E2E and Supabase jobs on the final HEAD.
- [ ] Create/link staging Supabase and populate secrets outside git.
- [ ] Apply migrations and repeat admin/tailor/employee browser + direct RLS matrix on staging.
- [ ] Create staging deployment and attach staging URL.
- [ ] Verify backup/restore and record release/rollback owner.
- [ ] Configure production observability, alert destination and incident owner.

Do not mark an external item complete from local code inspection alone.