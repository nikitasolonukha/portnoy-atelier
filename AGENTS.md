# Portnoy project instructions

## Read first

Before planning, read `docs/ONBOARDING.md`, `docs/PROJECT_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`, and any scoped `.cursor/rules/*.mdc`. For feature, database, or release work apply the matching project skill.

## Invariants

- Stack: Next.js 16.2 App Router, React 19, strict TypeScript, Tailwind 4, Supabase, pnpm 10.24, Node 22.19.
- Dependency direction: `app/interface → application → ports/domain`; `infrastructure` implements ports.
- Server Components by default; Client Components only for state/effects/browser events.
- Validate env, HTTP, file rows, params, and DB JSON with Zod or PostgreSQL constraints.
- `APP_MODE` and `NEXT_PUBLIC_APP_MODE` are explicit and equal: `demo` or `supabase`. Never silently fall back.
- UI and route handlers never query Supabase directly. Use application services/repositories.
- Never bypass RLS with service-role credentials in user flows.
- Database changes are new migrations with pgTAP, types, docs, and rollback/forward-fix notes.
- Do not add 3D/WebGL/Three.js/GLB/fake 3D unless scope changes explicitly.
- Do not present future or external features as complete without evidence.

## Testing workflow

Use RED → GREEN → REFACTOR. A bug fix begins with a reproducer. Minimum coverage is 80% branches/functions/lines/statements; do not narrow includes to game the gate.

Commands:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:coverage`
- `pnpm test:integration`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm verify`
- DB changes: `pnpm db:reset`, `pnpm db:test`, `pnpm db:types`

## API and errors

REST lives under `/api/v1` and follows `openapi/portnoy-v1.yaml`. Routes authenticate, authorize, validate, call a use case, and map the response. Public errors use stable codes and safe messages. Structured logs redact password/token/secret/cookie/authorization.

## UI

Preserve the atelier design direction and accessibility: native semantics, connected labels/errors, 44px targets, visible focus, reduced motion, loading/empty/error/permission states. Verify desktop and iPad portrait/landscape.

## Handoff

Update `docs/TASKS.md` in the same change. Report changed contracts, migrations, commands run, evidence, and external verification still required. Conversation history is not a source of truth.

## Source control

- Follow `docs/GIT_WORKFLOW.md`: protected `main`, short-lived branches, PR-only merges and Conventional Commits.
- Begin with `git status -sb` and `git fetch --prune origin`; never mix unrelated changes.
- Never store credentials in files, commits, remotes, prompts copied into docs, or command arguments. Use OS/GitHub/deployment secret stores.
- Never force-push or rewrite shared history. Revert published changes and use forward-only corrective DB migrations.
- Before handoff, leave a clean tree, pushed commit/PR, exact verification evidence and rollback reference.
