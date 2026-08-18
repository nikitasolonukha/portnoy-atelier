---
name: portnoy-feature
description: Delivers a Portnoy application feature through architecture, TDD, API, UI, documentation, and release verification. Use when adding or changing catalog, import, configurator, configuration, auth, or operational behavior.
---

# Portnoy feature delivery

1. Read `AGENTS.md`, `docs/ONBOARDING.md`, the relevant feature files, and `docs/TASKS.md`.
2. Write the user journey and acceptance criteria in `docs/TASKS.md`.
3. Identify the affected domain type, schema, port, use case, adapter, route, and UI.
4. Add a failing test at the lowest useful layer and verify RED.
5. Implement inward-out: domain/schema → use case → port/adapter → route → UI.
6. Keep route handlers thin and make public errors follow `docs/API.md`.
7. Add integration coverage for new endpoints and E2E coverage for the critical user outcome.
8. Update architecture/API/database decisions when contracts change.
9. Run `pnpm verify`, then the relevant desktop and iPad E2E projects.
10. Record remaining external evidence honestly; never label unverified Supabase or deployment work complete.
