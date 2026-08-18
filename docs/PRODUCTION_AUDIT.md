# Production readiness audit

Дата локальной проверки: 2026-08-19.

Итог: **release candidate и GitHub CI READY; production deployment NOT READY** до появления staging/backup/observability evidence. Это ограничение окружения, а не скрытая заглушка функциональности.

## Подтверждено локально

- `pnpm verify`: lint, strict TypeScript, 53 unit-теста, 9 API integration-тестов и production build прошли.
- Coverage: statements/lines 94.09%, branches 87.70%, functions 87.09% при обязательном пороге 80%.
- `pnpm test:e2e`: 62 passed, 2 intentionally not-applicable skips для mobile-nav проверки на viewport шире 900px; desktop, iPad portrait/landscape и mobile входят в matrix, включая CSV/XLSX/legacy XLS.
- `pnpm db:reset`: чистая БД воспроизводимо применяет шесть migrations и seed.
- `pnpm db:test`: 31/31 pgTAP assertions прошли после clean reset, включая регрессию audit-trigger.
- `pnpm db:types`: типы воспроизводимо генерируются из локальной схемы.
- `pnpm test:e2e:supabase`: 5/5 на production build с реальными локальными Supabase Auth, JWT/RLS, Postgres и private Storage.
- Ролевая матрица подтверждает employee read-only, tailor create/update без delete и admin delete одновременно на UI/API и прямом RLS уровне.
- Полный Supabase flow подтверждает fabric create/edit/reload, photo/texture replace/reload, import result, configuration create/reload/update without duplicate, duplicate/compare и logout.
- Docker image и compose service собираются; read-only container возвращает 200 на liveness/readiness.
- `pnpm audit --prod --audit-level high`: известных уязвимостей нет после обновления Next.js до 16.3.1 и SheetJS до 0.20.3.
- Secret/debug/placeholder/3D dependency scan не обнаружил credentials, production-заглушек, debug statements или 3D runtime dependencies.
- Auth proxy, role checks, RLS, private Storage, input validation, safe errors, redacted structured logs и security headers присутствуют в коде.
- Upload изображений проверяет размер, число файлов, MIME и magic bytes; orphaned Storage object удаляется при ошибке metadata insert.
- GitHub Actions run `32195419805`: `quality` pass, demo `e2e` pass, real `supabase` pass; draft PR #5 содержит полный reviewable diff.

## Что ещё блокирует production deployment

- Нет подключённого staging Supabase и доказательства применения migration на нём.
- Локальная real-Supabase матрица выполнена, но ещё не повторена против staging.
- Нет staging URL, настроенного alert destination и назначенного incident owner.
- Нужны подтверждённые backup/restore и release owner.

Production нельзя объявлять READY только по локальному коду. Источник правды для оставшихся действий — `docs/TASKS.md` и `docs/RELEASE_CHECKLIST.md`.
