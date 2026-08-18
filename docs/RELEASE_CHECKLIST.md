# Release checklist

## Code

- [ ] Clean intended diff; lockfile committed.
- [ ] `pnpm verify` green.
- [ ] `pnpm test:e2e` green for desktop and iPad/WebKit.
- [ ] No skipped tests or narrowed coverage include.

## Data and auth

- [ ] Migrations reset/test green locally.
- [ ] Staging migrations applied from files only.
- [ ] Admin/tailor/employee RLS smoke tests passed without service key.
- [ ] Backup and forward-fix/rollback owner recorded.

## Runtime

- [ ] Env contract passes; demo/supabase mode matches client/server.
- [ ] Liveness and readiness green.
- [ ] Previous immutable deployment/image available.
- [ ] Structured logs and alert destination configured.

## Product

- [ ] Login → fabric → configurator → save → compare passes.
- [ ] Import fixture passes with preview/result.
- [ ] iPad landscape and portrait checked.
- [ ] Demo credentials/data are not present in Supabase production bundle.

## Evidence

Release: __________  Commit: __________  Owner: __________  Date: __________

CI URL: __________  Staging URL: __________  Migration version: __________
