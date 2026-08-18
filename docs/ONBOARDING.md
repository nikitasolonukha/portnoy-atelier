# Onboarding: Портной

## Что это

Full-stack модуль ателье для сотрудников: авторизация, каталог тканей, импорт таблиц, data-driven конфигуратор и сравнение сохранённых вариантов. 3D намеренно вне scope.

## Стек

- Next.js 16.2 App Router, React 19, strict TypeScript, Tailwind 4.
- Supabase PostgreSQL/Auth/Storage/RLS; явный `demo` adapter для автономной разработки.
- Zod 4, Zustand, SheetJS, Vitest, Playwright, pgTAP.
- pnpm 10.24, Node 22.19, Docker standalone runtime.

## Карта архитектуры

```text
Browser UI / Server Components
        ↓
Next route handlers /api/v1 (auth + validation + envelope)
        ↓
Application services (use cases)
        ↓
Repository ports (interfaces)
        ↓
Supabase adapters ───── Demo adapters
        ↓
PostgreSQL + RLS + Storage
```

Зависимости всегда направлены внутрь. `application` не импортирует Next.js или Supabase. UI не импортирует Supabase.

## Ключевые точки входа

- `src/app/(app)` — защищённые страницы.
- `src/app/api/v1` — REST API.
- `src/application` — use cases и ports.
- `src/infrastructure` — Supabase/demo adapters и auth.
- `src/schemas` — boundary validation.
- `supabase/migrations` — источник истины схемы.
- `e2e` — пользовательские critical flows.
- `.cursor/rules`, `.cursor/skills`, `.claude` — инструкции AI.

## Первый запуск

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Для реального Supabase: скопируйте `.env.example` в `.env.local`, задайте `APP_MODE=supabase` и ключи, затем `pnpm db:start`, `pnpm db:reset`, `pnpm dev:supabase`.

## Типовой feature flow

Schema/domain → failing unit test → use case → port → adapter → route integration test → UI → E2E → docs → `pnpm verify`.

## Где менять

- Новый endpoint: `src/app/api/v1` + OpenAPI + integration test.
- Новое бизнес-правило: `src/application` и unit test.
- Новая таблица/политика: новая migration + pgTAP + generated types.
- Новый экран: server page + feature client component при необходимости.
- Новая AI-конвенция: короткое scoped правило, не раздувайте `AGENTS.md`.
