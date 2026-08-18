# Progress

## Foundation complete

- [x] Next.js 16.2 / React 19 / strict TypeScript / Tailwind 4 / pnpm lockfile.
- [x] Accessible responsive app shell, catalog, import, configurator, save/duplicate/compare; 3D excluded.
- [x] Explicit demo/Supabase modes and environment validator.
- [x] Application use cases, repository ports, Supabase/demo adapters, `/api/v1` and OpenAPI.
- [x] Supabase Auth proxy, verified actor/role, RLS, private Storage schema.
- [x] Constraints, search indexes, user/update/audit/validation triggers and import idempotency metadata.
- [x] Unit coverage gate, API integration suite, pgTAP contract, desktop/iPad E2E.
- [x] CI, standalone Docker, health/readiness, runbook and release checklist.
- [x] Cursor rules/skills, Claude skills/commands/agent, AGENTS and AI handoff.

## External activation checklist

- [ ] Create/link real Supabase staging project; populate `.env.local` without committing secrets.
- [x] Local clean reset, migrations, seed, 18 pgTAP assertions and type generation verified.
- [ ] Apply migrations + pgTAP to linked staging Supabase and attach CI evidence.
- [x] Canonical Supabase TypeScript types generated from the verified local schema; domain relation aliases derive from them.
- [ ] Create admin/tailor/employee test users and execute role/RLS browser matrix.
- [x] Storage upload endpoint validates decoded JPEG/PNG/WebP signatures, size, count and rolls back orphaned objects.
- [ ] Connect Git remote, run GitHub CI, create staging deployment and fill `RELEASE_CHECKLIST.md`.
- [ ] Configure production observability/alerts and named incident owner.

Do not mark an external item complete from code inspection alone.