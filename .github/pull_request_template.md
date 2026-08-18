## What and why

Describe the user-visible outcome and motivation.

## Contracts and data

- API/OpenAPI changes:
- Migration/RLS changes:
- Environment changes:

## Verification

- [ ] `pnpm verify`
- [ ] Relevant E2E passed
- [ ] DB reset/pgTAP/types passed when schema changed
- [ ] No secrets or local runtime files are included
- [ ] Documentation and `docs/TASKS.md` are current

## Rollback

State the application revert commit/tag and any forward-fix migration required.
