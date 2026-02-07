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
 * Note: This is a standalone async function, not a hook
 */
export async function createRoom(actor: any, createWithAccount: boolean): Promise<RoomResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    const code = generateRoomCode();
    const hostId = 'host_' + Date.now(); // Temporary host ID
    
    const result = await actor.createRoomV2(code, hostId, createWithAccount);
    
    // Backend returns { room: Room, admin_token?: string }
    return { 
      ok: true, 
      code: result.room.code, 
      adminToken: result.admin_token || undefined 
    };
  } catch (error) {
    console.error('Failed to create room:', error);
    return { ok: false, message: 'Failed to create room' };
  }
}

/**
 * Fetch and validate a room by code
 * Note: This is a standalone async function, not a hook
 * This is a read-only operation and does not require an admin token
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

    return { ok: true, code };
  } catch (error) {
    console.error('Failed to fetch room:', error);
    return { ok: false, message: 'Failed to fetch room' };
  }
}
