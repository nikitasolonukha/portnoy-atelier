---
name: portnoy-release
description: Prepares and audits a Portnoy release using local evidence, CI-equivalent checks, migration safety, E2E, Docker health, and rollback documentation. Use before staging, demo, handoff, or production deployment.
---

# Portnoy release

1. Confirm the intended mode (`demo` or `supabase`) and release target.
2. Check worktree, dependency lockfile, env contract, pending migrations, and `docs/TASKS.md`.
3. Run `pnpm verify` and `pnpm test:e2e`.
4. For Supabase releases, run local reset/pgTAP and verify staging with a non-service-role account.
5. Build and health-check the standalone Docker image.
6. Review auth/RLS, uploads, logs, secrets, error states, backward compatibility, and rollback.
7. Save evidence in `docs/RELEASE_CHECKLIST.md`; never convert missing evidence into a pass.
8. Recommend ship/block with concrete blockers and owners.
