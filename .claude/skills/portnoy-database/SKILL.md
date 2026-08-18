---
name: portnoy-database
description: Changes the Portnoy Supabase schema safely with migrations, RLS, triggers, generated types, pgTAP tests, and rollback notes. Use for tables, columns, policies, storage, indexes, seed data, or database invariants.
---

# Portnoy database change

1. Read `docs/DATABASE.md`, `docs/MIGRATIONS.md`, and all unapplied migrations.
2. Create a new timestamped migration; do not modify applied files.
3. Make changes additive and compatible with the currently deployed application.
4. Add constraints/indexes and RLS policies for the new data surface.
5. Add audit behavior and actor attribution for writes.
6. Extend `supabase/tests/database_test.sql` before implementation and verify it fails for the intended reason.
7. Run `pnpm db:reset`, `pnpm db:test`, and `pnpm db:types`.
8. Update repository mappers, schemas, integration tests, `docs/DATABASE.md`, and rollback/forward-fix notes.
9. Never use service-role access to make a failing RLS test pass.
