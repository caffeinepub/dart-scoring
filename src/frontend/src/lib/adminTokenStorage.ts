/**
 * localStorage utilities for persisting and retrieving admin/scorer tokens by room code.
 * Includes safe error handling for storage failures.
 */

const ADMIN_TOKEN_PREFIX = 'dart_admin_token_';

/**
 * Normalize room code for consistent storage keys
 */
function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Save an admin token for a room code
 */
export function setAdminToken(roomCode: string, token: string): void {
  try {
    const normalizedCode = normalizeRoomCode(roomCode);
    const key = ADMIN_TOKEN_PREFIX + normalizedCode;
    localStorage.setItem(key, token);
  } catch (error) {
    console.error('[adminTokenStorage] Failed to save admin token:', error);
    // Non-fatal: don't crash the UI
  }
}

/**
 * Retrieve an admin token for a room code
 */
export function getAdminToken(roomCode: string): string | null {
  try {
    const normalizedCode = normalizeRoomCode(roomCode);
    const key = ADMIN_TOKEN_PREFIX + normalizedCode;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('[adminTokenStorage] Failed to retrieve admin token:', error);
    return null;
  }
}

/**
 * Remove an admin token for a room code
 */
export function removeAdminToken(roomCode: string): void {
  try {
    const normalizedCode = normalizeRoomCode(roomCode);
    const key = ADMIN_TOKEN_PREFIX + normalizedCode;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[adminTokenStorage] Failed to remove admin token:', error);
    // Non-fatal: don't crash the UI
  }
}
