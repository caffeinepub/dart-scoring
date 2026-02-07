// localStorage utilities for saved-game persistence

import type { Game, Turn } from './gameCore';

const SAVED_GAME_KEY = 'dart-scoring-saved-game';

/**
 * Migrate old Turn format to new format with darts array
 */
function migrateTurn(turn: any): Turn {
  return {
    ...turn,
    darts: turn.darts || [],
    turnTotal: turn.turnTotal ?? turn.scoredPoints,
    finishDart: turn.finishDart,
  };
}

/**
 * Save the current game state to localStorage
 * Returns true if successful, false if failed (e.g., quota exceeded)
 */
export function saveGame(game: Game): boolean {
  try {
    const serialized = JSON.stringify(game);
    localStorage.setItem(SAVED_GAME_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save game to localStorage:', error);
    return false;
  }
}

/**
 * Load a saved game from localStorage
 * Returns the Game object if found and valid, null otherwise
 */
export function loadSavedGame(): Game | null {
  try {
    const serialized = localStorage.getItem(SAVED_GAME_KEY);
    if (!serialized) {
      return null;
    }
    const game = JSON.parse(serialized) as any;
    
    // Basic validation: ensure it has required properties
    if (!game.settings || !game.players || !Array.isArray(game.turnHistory)) {
      console.warn('Invalid saved game structure, ignoring');
      return null;
    }

    // Migrate old turns to new format
    const migratedGame: Game = {
      ...game,
      turnHistory: game.turnHistory.map(migrateTurn),
      // Remove awaiting-confirmation phase if present (from old version)
      phase: game.phase === 'awaiting-confirmation' ? 'in-progress' : game.phase,
    };

    return migratedGame;
  } catch (error) {
    console.error('Failed to load saved game from localStorage:', error);
    return null;
  }
}

/**
 * Clear the saved game from localStorage
 */
export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVED_GAME_KEY);
  } catch (error) {
    console.error('Failed to clear saved game from localStorage:', error);
  }
}

/**
 * Check if a saved game exists
 */
export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(SAVED_GAME_KEY) !== null;
  } catch (error) {
    return false;
  }
}
