# Operations runbook

## Health

- Liveness: `GET /api/v1/health` — процесс и env contract.
- Readiness: `GET /api/v1/readiness` — выбранный adapter и доступность БД.
- Docker healthcheck вызывает liveness каждые 30 секунд.

## Local container

Локальный production-контейнер: `pnpm container:up`; остановка: `pnpm container:down`. Скрипт фиксирует project name `portnoy`, потому что Docker Compose не выводит корректное имя из кириллической папки.

## Deploy

CI gates: lint → types → coverage → integration → build → desktop/iPad E2E. Для Supabase release отдельно применяются migrations на staging и выполняются role/RLS smoke tests.

## Rollback приложения

Продвигайте предыдущий immutable Vercel deployment или Docker image SHA. Additive migrations остаются. Затем проверьте health, login, fabrics list и сохранение configuration.

## Инциденты

### 401/redirect loop

Проверить `APP_MODE`, Supabase URL/anon key, cookie domain и server time. Не заменять verified user данными из localStorage.

### 403 mutation

Проверить active profile role и RLS policy через обычный JWT. Service key запрещён для диагностики пользовательского потока.

### 503 readiness

Проверить Supabase status, network/DNS, migrations и `configuration_groups`. Liveness 200 при readiness 503 означает живой процесс с недоступной зависимостью.

### Import duplicate

Проверить `content_sha256`, status и duplicate strategy. Не повторять completed import без явного upsert.

## Логи

JSON events с code/event/timestamp. Password/token/cookie/authorization редактируются. Не логировать полные CSV rows или персональные данные.
