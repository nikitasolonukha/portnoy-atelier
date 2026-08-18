# Progress

## Foundation complete

- [x] Next.js 16.3.1 / React 19 / strict TypeScript / Tailwind 4 / pnpm lockfile.
- [x] Accessible responsive app shell, catalog, import, configurator, save/duplicate/compare; 3D excluded.
- [x] Explicit demo/Supabase modes and environment validator.
- [x] Application use cases, repository ports, Supabase/demo adapters, `/api/v1` and OpenAPI.
- [x] Supabase Auth proxy, verified actor/role, RLS, private Storage schema.
- [x] Constraints, search indexes, user/update/audit/validation triggers and import idempotency metadata.
- [x] Unit coverage gate, API integration suite, pgTAP contract, desktop/iPad/mobile E2E.
- [x] CI includes quality, demo E2E and real local-Supabase E2E gates; standalone Docker, health/readiness, runbook and release checklist are versioned.
- [x] Cursor rules/skills, Claude skills/commands/agent, AGENTS and AI handoff.

## External activation checklist

- [ ] Create/link real Supabase staging project; populate `.env.local` without committing secrets.
- [x] Private GitHub remote is connected and the implementation branch is versioned locally; push/remote SHA evidence is required at handoff.
- [x] Local clean reset applies all six migrations and seed; 31 pgTAP assertions and type generation verified.
- [x] Local admin/tailor/employee browser/API matrix and direct JWT/RLS matrix pass without service key in user flows.
- [ ] Apply migrations + pgTAP to linked staging Supabase and attach CI evidence.
- [x] Canonical Supabase TypeScript types generated from the verified local schema; domain relation aliases derive from them.
- [ ] Create staging admin/tailor/employee test users and repeat the browser/RLS matrix against staging.
- [x] Storage upload endpoint validates decoded JPEG/PNG/WebP signatures, size, count and rolls back orphaned objects.
- [ ] Push the final branch, attach a green GitHub Actions URL, create staging deployment and fill `RELEASE_CHECKLIST.md`.
- [ ] Configure production observability/alerts and named incident owner.
- [ ] Approve a production release only after staging, CI, backup/rollback and observability evidence are attached.

Do not mark an external item complete from code inspection alone.
