# Specification

## Summary
**Goal:** Add scorer/admin token protection so only authorized Host/Scorer devices can mutate room/game state, while TV/display views remain read-only and token-free.

**Planned changes:**
- Extend backend Room/Game state to include a server-generated, secret admin/scorer token stored with the room (and/or game) and not derivable from the room code.
- Update all backend state-mutating methods to require an admin token parameter and validate it; return structured non-trapping errors for missing/invalid tokens while keeping read-only methods unchanged.
- Ensure TV/display snapshot and realtime subscription flows remain callable with only the room code/game identifier and do not request or use any token.
- Update frontend Create Room flow to capture the returned admin/scorer token, persist it locally (e.g., localStorage keyed by room code), and automatically use it for Host/Scorer actions on that device.
- Add minimal frontend UI to enter/save a scorer token when joining/opening Host/Scorer without a saved token, and show clear English error states when the token is invalid or missing.
- Plumb the admin token through existing frontend API helpers so all Host/Scorer mutation calls include the token parameter, while read-only calls remain unchanged.

**User-visible outcome:** Hosts/Scorers can control scoring across multiple devices by using a saved/entered scorer token; unauthorized devices cannot change game state, and TV/display pages continue to work without any token.
