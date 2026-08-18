# Architecture decisions

## ADR-001 — JSONB configuration settings

Store selected option keys in `configurations.settings`; validate them against active DB groups/options in application and a PostgreSQL trigger. This keeps the UI data-driven without a table per garment element.

## ADR-002 — Explicit adapter mode

`demo` and `supabase` are explicit server/browser modes. No silent fallback. Demo remains autonomous; Supabase mode uses Auth/API/RLS and fails fast on missing env.

## ADR-003 — Ports and adapters

Application services depend on repository interfaces. Supabase and demo implement the same ports. Route handlers and UI cannot query Supabase directly.

## ADR-004 — Forward-only database delivery

Applied migrations are immutable. Releases prefer additive/backward-compatible schema; rollback uses previous app artifact plus forward-fix migration.

## ADR-005 — Stable REST v1 envelope

Internal API uses `/api/v1`, semantic status codes, `{data}` success and stable `{error}` responses. OpenAPI is the machine-readable contract.

## ADR-006 — Layered authorization

Proxy refreshes sessions, routes verify actor/role, and RLS/constraints enforce final authorization and integrity. Service role is not part of user request execution.

## ADR-007 — No 3D in Stage 1

No Three.js/WebGL/GLB or misleading pseudo-3D. The flat technical preview preserves configurator UX without creating an architectural dependency on an unavailable asset.

## ADR-008 — Test pyramid as release contract

Unit coverage ≥80%, API integration, pgTAP, and desktop+iPad E2E are required evidence. Missing external staging evidence remains explicit in the release checklist.

## ADR-009 — Fabric is not a configuration option group

The selected material is stored only in `configurations.fabric_id`. JSONB `settings` contains suit construction options, so the configurator has one fabric selector and six option groups without a duplicate empty fabric step.
