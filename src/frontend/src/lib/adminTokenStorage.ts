/**
 * localStorage utilities for persisting admin/scorer tokens by room code.
 * Tokens are required for state-mutating operations in multi-device rooms.
 */

const STORAGE_KEY_PREFIX = 'dart_scorer_admin_token_';

/**
 * Get the stored admin token for a room code
 */
export function getAdminToken(roomCode: string): string | null {
  try {
    const key = STORAGE_KEY_PREFIX + roomCode;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Failed to read admin token from storage:', error);
    return null;
  }
}

/**
 * Save an admin token for a room code
 */
export function setAdminToken(roomCode: string, token: string): void {
  try {
    const key = STORAGE_KEY_PREFIX + roomCode;
    localStorage.setItem(key, token);
  } catch (error) {
    console.error('Failed to save admin token to storage:', error);
  }
}

/**
 * Clear the admin token for a room code
 */
export function clearAdminToken(roomCode: string): void {
  try {
    const key = STORAGE_KEY_PREFIX + roomCode;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear admin token from storage:', error);
  }
}
