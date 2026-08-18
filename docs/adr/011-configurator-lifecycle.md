# ADR-011 — Canonical configurator identity and lifecycle

## Status

Accepted for Stage 1.

## Decision

The configurator owns an explicit `clean / dirty / saving / error` draft state with a saved baseline. The workspace bootstrap remains responsible for loading Supabase business data before the configurator renders.

The first successful save adopts the repository-returned ID and replaces the browser URL with `/configurator/{id}`. Every later save updates that same record. Reset restores the last successful baseline. Reload and direct open rebuild the draft from backend-owned workspace data.

Duplicate is a create operation with copied values and a new identity; it waits for persistence and opens the canonical copy route. Compare treats fabric as a first-class row before the six construction groups.

## Consequences

- A client-generated placeholder ID never becomes the Supabase identity.
- Save buttons are double-submit safe and errors keep the draft dirty.
- Browser reload and explicit in-app exit warn when edits are unsaved.
- 3D remains outside this lifecycle and outside Stage 1.
