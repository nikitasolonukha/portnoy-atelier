# GitHub workflow, backup and rollback

## Daily workflow for humans and AI agents

1. Read `AGENTS.md`, `docs/ONBOARDING.md`, `docs/TASKS.md` and the applicable project skill.
2. Run `git status -sb` and `git fetch --prune origin`.
3. Never develop directly on `main`. Create `agent/<short-name>`, `feature/<short-name>` or `fix/<short-name>` from current `origin/main`.
4. Write a failing test first, implement the smallest vertical slice, update contracts/docs, then run `pnpm verify` and applicable E2E/DB checks.
5. Commit with Conventional Commits and push the branch. Merge through a pull request only after CI is green.
6. Do not force-push shared branches and never commit `.env*`, access tokens, keys, database dumps or Supabase runtime files.

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/short-description
# change + test
git add <explicit-files>
git commit
git push -u origin HEAD
gh pr create --draft --fill
```

## Checkpoints and releases

- `main` is the recoverable integration history.
- Annotated tags mark known-good releases. Never move or reuse a published tag.
- Before a risky migration or large refactor, create a temporary branch or annotated pre-change tag and push it.
- GitHub is the off-machine backup; local-only commits are not a backup.

```bash
git tag -a v0.1.0-foundation -m "Verified Stage 1 foundation"
git push origin v0.1.0-foundation
```

## Safe rollback

Published history is reverted, not rewritten:

```bash
git switch main
git pull --ff-only origin main
git switch -c fix/revert-bad-change
git revert <bad-commit-sha>
pnpm verify
git push -u origin HEAD
gh pr create --draft --fill
```

To inspect or recover a known-good release without moving `main`:

```bash
git switch -c recovery/from-v0.1.0 v0.1.0-foundation
pnpm install --frozen-lockfile
pnpm verify
```

For an unpushed local commit, prefer `git reset --soft HEAD^` only when nobody else can depend on it. Never use `reset --hard` as a routine rollback.

Database migrations are forward-only. Never delete or edit an applied migration. Restore application code with a revert, then add a corrective migration after backup/impact review. `pnpm db:reset` is local-only and must never target staging or production.

## Recovery on another machine

```bash
gh repo clone nikitasolonukha/portnoy-atelier
cd portnoy-atelier
corepack enable
pnpm install --frozen-lockfile
pnpm verify
pnpm test:e2e
```

Environment secrets come from the deployment secret store or a newly created `.env.local`; they are intentionally absent from Git.
