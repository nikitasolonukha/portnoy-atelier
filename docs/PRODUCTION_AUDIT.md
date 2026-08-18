# Production readiness audit

Дата локальной проверки: 2026-08-18. Итог: 81/100 — сильная handoff-база, готовая к подключению staging; production release ещё требует внешних доказательств.

## Подтверждено локально

- `pnpm verify`: lint, strict TypeScript, 38 unit-тестов, 5 API integration-тестов и production build прошли.
- Coverage: statements/lines 92.76%, branches 84.69%, functions 86.20%.
- `pnpm test:e2e`: 16/16 сценариев прошли на standalone build в Chromium desktop и WebKit/iPad.
- `pnpm db:reset`: чистая БД воспроизводимо применяет обе migration и seed.
- `pnpm db:test`: 18/18 pgTAP assertions прошли после clean reset.
- `pnpm db:types`: типы воспроизводимо генерируются из локальной схемы.
- Docker image и compose service собираются; read-only container возвращает 200 на liveness/readiness.
- Auth proxy, role checks, RLS, private Storage, input validation, safe errors, redacted structured logs и security headers присутствуют в коде.
- Upload изображений проверяет размер, число файлов, MIME и magic bytes; orphaned Storage object удаляется при ошибке metadata insert.

## Что ограничивает оценку

- Нет подключённого staging Supabase и доказательства применения migration на нём.
- Не выполнена браузерная матрица admin/tailor/employee против реального RLS/JWT.
- GitHub workflow существует локально, но нет remote/CI URL и зелёного внешнего run.
- Нет staging URL, настроенного alert destination и назначенного incident owner.
- Dependency vulnerability scan не запускался: внешний registry audit не был разрешён в этой сессии.

Эти пункты являются действиями окружения, а не скрытыми заглушками приложения. Они перечислены в `docs/TASKS.md` и `docs/RELEASE_CHECKLIST.md`; их нельзя отмечать выполненными только по локальному коду.
