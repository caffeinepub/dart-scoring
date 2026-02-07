/**
 * Helper utilities for consistent player name rendering across the app.
 * Prefers displayName when available, falls back to name field.
 */

import type { GameSnapshot } from './realtimeEventEnvelope';

/**
 * Get the preferred display name for a player.
 * Returns displayName if present, otherwise falls back to name.
 */
export function getPlayerDisplayName(player: GameSnapshot['players'][0]): string {
  return player.displayName || player.name;
}

/**
 * Check if a player seat is unclaimed (no userId assigned).
 */
export function isPlayerUnclaimed(player: GameSnapshot['players'][0]): boolean {
  return !player.userId || player.userId === null;
}
