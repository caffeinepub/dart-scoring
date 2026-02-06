# Specification

## Summary
**Goal:** Replace the `/` page with a Start Game configuration flow and reliably initialize `/game` from the saved settings.

**Planned changes:**
- Update `/` (StartGamePage) to show a touch-friendly configuration form: game mode radio (301/501), a Double Out toggle, and a 1–4 player list editor (add player, per-player name, remove with a minimum of 1 player).
- Add a “Start Game” action on `/` that saves a single settings object to `localStorage`, sanitizing player names by auto-filling blanks with `Player N`, then navigates to `/game`.
- Update `/game` (GamePage) to read settings from `localStorage` on load and initialize player cards and starting scores accordingly; fall back to defaults (501, Double Out off, two players: Player 1/Player 2) when settings are missing.

**User-visible outcome:** Users can configure a new game on `/` (mode, Double Out, 1–4 player names) and start it; `/game` opens with the configured players and initial scores (or sensible defaults if opened directly).
