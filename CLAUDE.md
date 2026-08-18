# Claude Code instructions — Portnoy

Read `AGENTS.md` first; it is the primary project contract. Then read `docs/ONBOARDING.md`, the relevant scoped `.cursor/rules`, and `docs/TASKS.md`.

Project skills are mirrored in `.claude/skills`: `portnoy-feature`, `portnoy-database`, `portnoy-release`. Use the relevant skill instead of inventing a workflow. Slash commands: `/new-feature` and `/verify`.

Never bypass RLS, silently switch modes, edit applied migrations, weaken tests, or add 3D without an explicit scope change. Use RED→GREEN, thin routes, application ports, Supabase adapters, safe errors, and documented evidence. Finish with `pnpm verify`; run E2E for user flows and pgTAP/reset/types for DB changes.

## Git and recovery

Read and follow `docs/GIT_WORKFLOW.md`. Work on a short-lived branch, never directly on `main`; run the staged-secret hook and required tests; push through a PR. Never write tokens or environment secrets into the repository. Revert shared commits instead of rewriting history, and treat database migrations as forward-only.
