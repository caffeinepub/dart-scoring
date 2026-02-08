/**
 * Helper to build authentication headers for backend requests.
 * Handles admin tokens for guest/no-account rooms.
 * No longer uses OAuth Bearer tokens.
 */

import { getAdminToken } from './adminTokenStorage';

export interface AuthHeadersOptions {
  roomCode?: string;
  isMutation?: boolean;
}

/**
 * Builds authentication headers for backend requests.
 * 
 * For mutations:
 * - If roomCode is provided, use X-ADMIN-TOKEN from storage (for guest rooms)
 * 
 * For authenticated requests:
 * - Use the IC agent/actor with Internet Identity delegation
 * 
 * @param options - Configuration for header building
 * @returns Headers object to merge with request headers
 */
export function buildAuthHeaders(options: AuthHeadersOptions = {}): Record<string, string> {
  const { roomCode, isMutation = false } = options;

  const headers: Record<string, string> = {};

  // Only add auth headers for mutations
  if (isMutation && roomCode) {
    // Use admin token for no-account rooms
    const adminToken = getAdminToken(roomCode);
    if (adminToken) {
      headers['X-ADMIN-TOKEN'] = adminToken;
    }
  }

  return headers;
}
