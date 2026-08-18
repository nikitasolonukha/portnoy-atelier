# Verify Portnoy

Run the repository verification gates and report evidence, not assumptions:

1. `pnpm env:check` with the intended mode.
2. `pnpm lint` and `pnpm typecheck`.
3. `pnpm test:coverage` and `pnpm test:integration`.
4. `pnpm build` (or `pnpm build:supabase` with real env).
5. `pnpm test:e2e` for desktop and iPad/WebKit.
6. If migrations changed: `pnpm db:reset`, `pnpm db:test`, `pnpm db:types`.
7. Summarize passes, failures, missing external evidence, and exact next action.
