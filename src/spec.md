# Specification

## Summary
**Goal:** Make the backend the single source of truth for dart game state by adding deterministic turn application, undo, and turn editing with replay, returning an updated game snapshot after each mutation.

**Planned changes:**
- Add a backend gameplay mutation method equivalent to `POST /games/{game_id}/turns` to apply a new turn (input_mode: `total` or `3darts`, source: `manual` or `voice`) and return an updated snapshot.
- Implement deterministic backend scoring + rule enforcement for both input modes, including validation, bust handling, and deterministic double-out; persist derived fields per turn (scored_total, is_bust, remaining_before/after).
- Add a backend undo method equivalent to `POST /games/{game_id}/undo` to remove the most recent turn and recompute/persist correct remaining scores, returning an updated snapshot.
- Add a backend edit-turn method equivalent to `PUT /turns/{turn_id}` to edit an existing turn and deterministically replay/recompute all subsequent turns from that point, returning an updated snapshot.
- Standardize success/error responses for create/undo/edit to always return either (a) an updated snapshot or (b) a structured, non-trapping error with a machine-readable code and an English message.

**User-visible outcome:** The frontend (once wired) can create turns (total or 3 darts), undo the last turn, and edit a prior turn, with the backend deterministically enforcing rules and returning an updated game snapshot (or structured English error) after each operation.
