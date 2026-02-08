/**
 * Room operations using backend actor (Internet Computer canister)
 */

import { getAdminToken } from './adminTokenStorage';

/**
 * Generate a random 6-character room code
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface RoomResult {
  ok: boolean;
  code?: string;
  adminToken?: string;
  message?: string;
}

/**
 * Create a new room with optional account-based ownership
 * Uses backend actor createRoomV2
 */
export async function createRoom(actor: any, createWithAccount: boolean): Promise<RoomResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    const code = generateRoomCode();
    const hostId = 'host_' + Date.now();

    const result = await actor.createRoomV2(code, hostId, createWithAccount);

    if (result.__kind__ === 'error') {
      return { ok: false, message: result.error.message || 'Failed to create room' };
    }

    const { room, admin_token } = result.success;

    return {
      ok: true,
      code: room.code,
      adminToken: admin_token || undefined,
    };
  } catch (error: any) {
    console.error('Failed to create room:', error);
    return { ok: false, message: error.message || 'Network error. Please try again.' };
  }
}

/**
 * Fetch and validate a room by code
 * Uses backend actor getRoomByCode
 */
export async function getRoomByCode(actor: any, code: string): Promise<RoomResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    const room = await actor.getRoomByCode(code);

    if (!room) {
      return { ok: false, message: 'Room not found. Please check the code.' };
    }

    return { ok: true, code: room.code };
  } catch (error: any) {
    console.error('Failed to get room:', error);
    return { ok: false, message: error.message || 'Network error. Please try again.' };
  }
}
