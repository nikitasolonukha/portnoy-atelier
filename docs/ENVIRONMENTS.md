# Environments

Режим всегда задаётся двумя одинаковыми значениями: `APP_MODE` для server и `NEXT_PUBLIC_APP_MODE` для browser bundle.

## demo

Автономный development/demo adapter, seed и localStorage cache. Не используется для production data и всегда обозначается в UI.

## supabase

Настоящие Auth/PostgreSQL/Storage/RLS. Требует `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Никакого automatic fallback в demo.

## Матрица

- Local demo: `pnpm dev`.
- Local Supabase: `pnpm db:start`, `pnpm db:reset`, `.env.local`, `pnpm dev:supabase`.
- CI: demo mode для deterministic app tests; Supabase CLI job для DB tests при доступном Docker.
- Staging/production: supabase mode, разные Supabase projects и Vercel environments.

Перед запуском: `pnpm env:check`. `APP_VERSION` должен быть commit SHA или release tag.
