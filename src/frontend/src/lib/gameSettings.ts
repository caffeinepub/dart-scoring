// Game settings types and localStorage utilities

export interface GameSettings {
  mode: 301 | 501;
  doubleOut: boolean;
  players: string[];
}

const STORAGE_KEY = 'dart-game-settings';

const DEFAULT_SETTINGS: GameSettings = {
  mode: 501,
  doubleOut: false,
  players: ['Player 1', 'Player 2'],
};

/**
 * Save game settings to localStorage
 */
export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save game settings:', error);
  }
}

/**
 * Load game settings from localStorage with fallback to defaults
 */
export function loadGameSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);
    
    // Validate and sanitize loaded settings
    const mode = parsed.mode === 301 || parsed.mode === 501 ? parsed.mode : DEFAULT_SETTINGS.mode;
    const doubleOut = typeof parsed.doubleOut === 'boolean' ? parsed.doubleOut : DEFAULT_SETTINGS.doubleOut;
    const players = Array.isArray(parsed.players) && parsed.players.length > 0 
      ? parsed.players.slice(0, 4) // Max 4 players
      : DEFAULT_SETTINGS.players;

    return { mode, doubleOut, players };
  } catch (error) {
    console.error('Failed to load game settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Sanitize player names: trim whitespace and replace empty names with defaults
 */
export function sanitizePlayerNames(names: string[]): string[] {
  return names.map((name, index) => {
    const trimmed = name.trim();
    return trimmed || `Player ${index + 1}`;
  });
}
