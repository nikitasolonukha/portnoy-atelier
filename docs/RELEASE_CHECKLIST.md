# Release checklist

## Code

- [ ] Clean intended diff; lockfile committed.
- [ ] `pnpm verify` green.
- [ ] `pnpm test:e2e` green for desktop, iPad portrait/landscape and mobile.
- [ ] Only documented not-applicable skips; no narrowed coverage include.

## Data and auth

- [ ] Migrations reset/test/types green locally.
- [ ] `pnpm test:e2e:supabase` green with ordinary user JWTs; service key limited to fixture setup/cleanup.
- [ ] Staging migrations applied from files only.
- [ ] Admin/tailor/employee RLS smoke tests passed on staging without service key.
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
