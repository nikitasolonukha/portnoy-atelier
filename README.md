# Портной

Production-oriented Stage 1 foundation for an atelier: auth, fabric catalog, XLS/XLSX/CSV import, data-driven suit configuration, saved variants, and comparison. 3D is intentionally excluded.

## Quick start

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Demo login: `admin@portnoy.demo` / `atelier2026`. Demo mode is explicit and isolated; it is not a production fallback.

## Supabase mode

```bash
pnpm db:start
pnpm db:reset
# copy .env.example to .env.local and fill Supabase values
pnpm dev:supabase
```

## Quality gates

```bash
pnpm verify
pnpm test:e2e
pnpm db:test
```

- Unit coverage gate: 80% on application/shared business layers.
- Integration: `/api/v1` contracts and adapters.
- Database: pgTAP tables, policies, triggers, indexes, seed.
- E2E: production build in desktop Chromium and iPad WebKit.

## Production container

```bash
pnpm container:up
# http://localhost:3107/api/v1/health
pnpm container:down
```

## Architecture and handoff

Start with `docs/ONBOARDING.md` and `AGENTS.md`. HTTP contract: `openapi/portnoy-v1.yaml`. DB source of truth: `supabase/migrations`. AI workflows: `.cursor/rules`, `.cursor/skills`, `.claude`.

External Supabase/staging credentials are not committed. A production handoff must attach environment, migration, CI and role/RLS evidence described in `docs/RELEASE_CHECKLIST.md`.

GitHub branches, backups and rollback: `docs/GIT_WORKFLOW.md`.
