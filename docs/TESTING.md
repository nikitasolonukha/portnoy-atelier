# Стратегия тестирования

## Пирамида

- Unit: schemas, pagination client, filtering, configurator state, import planning/execution, permissions, errors and mappers.
- Integration: route handlers + auth/demo adapter + HTTP envelope.
- Database: pgTAP for schema, indexes, triggers, seed, service fixture grants and active-profile RLS.
- Demo E2E: self-contained demo production build on desktop, iPad portrait/landscape and mobile.
- Supabase E2E: production build with real local Auth JWT, RLS, Postgres and private Storage.

## Commands

```bash
pnpm verify
pnpm test:e2e
pnpm db:reset
pnpm db:test
pnpm db:types
pnpm test:e2e:supabase
```

`pnpm test:e2e` always rebuilds the demo bundle before Playwright. Это исключает запуск demo suite на bundle, ранее собранном с `NEXT_PUBLIC_APP_MODE=supabase`. Production E2E явно использует один worker: demo adapter имеет общий process-local backend state, а детерминизм важнее ложной локальной скорости.

Coverage gate: 80% branches/functions/lines/statements; include patterns нельзя сужать ради зелёного отчёта.

## Current local evidence (2026-08-19)

- Unit: 62/62 across 23 files.
- Integration: 9/9 across 6 files.
- Coverage: statements 94.11%, branches 87.80%, functions 87.09%, lines 94.11%.
- Demo E2E: 70 passed, 2 intentionally not-applicable desktop/landscape mobile-nav skips.
- Supabase E2E: 13/13; responsive critical flow passes desktop, iPad landscape, iPad portrait and mobile.
- pgTAP: 37/37 after clean reset.

Supabase scenarios include 250-row pagination/search/selector, partial import patch semantics, inactive-session direct access, role matrix, configuration ownership, assets, archive/restore, used-fabric conflict, canonical repeated save, duplicate, compare and logout protection. Service role is restricted to test fixture setup/cleanup; user flows use ordinary JWTs.