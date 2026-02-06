# Specification

## Summary
**Goal:** Add Double Out finish confirmation plus a complete Game Over flow that shows the winner and turn count, with Rematch/New Game actions.

**Planned changes:**
- Update game-core state and rules to support leg completion, including an “awaiting double-finish confirmation” state when Double Out is ON and a checkout reaches 0.
- Expose game-core information needed by the UI: whether confirmation is pending, whether the game is over, the winning player, and number of turns taken to win.
- In the /game UI, show a modal with exact text “Was it a double finish?” when awaiting confirmation; block further score entry until resolved; YES confirms win, NO reverts the last turn as a bust.
- Add a Game Over screen/section that appears when the game is won, displaying winner name and turns taken, with buttons: “Rematch” (same settings) and “New Game” (navigate to /), with all new UI text in English.

**User-visible outcome:** Players can finish a game, confirm double-out checkouts when required, then see a Game Over screen with winner and turn count, and choose to rematch with the same settings or start a new game.
