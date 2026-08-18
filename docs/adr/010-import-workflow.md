# ADR-010 — Import is an explicit, auditable workflow

## Status

Accepted for Stage 1.

## Decision

Spreadsheet headers are mapped by the user before validation. Existing articles use an explicit `skip` or `update` strategy; duplicate rows inside one file fail independently. Execution is awaited row by row so counts and per-row errors are truthful.

Supabase records the owner, strategy-aware content hash, terminal `created/updated/skipped/failed` counts and completion audit event. Demo mode implements the same browser-visible semantics locally without pretending to persist server-side import history.

## Consequences

- Re-importing identical rows with the same strategy is rejected after successful completion.
- The UI always shows mapping, preview and explicit result stages.
- Partial success is a first-class result and retains per-row errors.
- Import ledger access is owner-scoped by RLS; route role checks do not replace database enforcement.
