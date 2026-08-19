# Production readiness audit

Дата локальной проверки: 2026-08-19.

## Verdict

**Stage 1 core (без 3D): READY.** External production deployment остаётся gated до staging, backup/restore, observability и release-owner evidence. Это operational gate, а не незавершённая функция Stage 1.

## Verified locally

- `pnpm verify`: lint, strict TypeScript, 62 unit tests, 9 integration tests, coverage gate, demo production build and standalone runtime passed.
- Coverage: statements 94.11%, branches 87.80%, functions 87.09%, lines 94.11%.
- `pnpm test:e2e`: 70 passed, 2 expected viewport-not-applicable skips across desktop/iPad portrait/iPad landscape/mobile.
- `pnpm db:reset`: all 7 forward-only migrations and seed applied from an empty local database.
- `pnpm db:test`: 37/37 pgTAP assertions.
- `pnpm db:types`: reproducibly generated `has_active_profile` and current schema types.
- `pnpm test:e2e:supabase`: 13/13 with real Auth JWT, RLS, Postgres and private Storage.
- 250-fabric dataset: page 2 record, backend search, UI catalog search, total and configurator selector verified; teardown removes all generated rows.
- Import update preserves unmapped manufacturer/composition/currency, updates mapped values and explicitly clears a mapped blank text cell.
- Inactive admin/tailor/employee lose direct access to business tables and `fabric-assets` Storage without waiting for JWT expiry.
- Full real flow covers create, photo/texture upload and reload, texture replacement, photo/texture deletion, edit, archive/reload/filter/restore, import, configuration create/reload/repeated update, duplicate independence, compare, used-fabric 409 and protected logout.
- pnpm audit --prod --audit-level high: no known vulnerabilities.
- Secret/service-role/client scan found no committed credentials or client-exposed service key. No 3D runtime dependencies exist.

## Confirmed existing behavior, not reimplemented

- Invalid compare IDs already produced an explicit empty state and never fell back to arbitrary configurations; E2E now locks it down.
- Import/create/edit actions and direct routes already respected role-aware UX; direct-route/API regressions now prove it.
- Texture replacement already removed the previous object/metadata with rollback behavior.
- No fabric duplicate action existed, so no half-working action was retained.
- Compare already included fabric as a first-class difference row.

## External deployment gates

- Apply migrations and role/RLS smoke to a linked staging Supabase project.
- Verify backup restore and record rollback/release owner.
- Configure production logs, alert destination and incident owner.
- Attach green GitHub CI and staging URL to `docs/RELEASE_CHECKLIST.md` before production approval.