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

/**
 * Generate a random admin token
 */
function generateAdminToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export interface RoomResult {
  ok: boolean;
  code?: string;
  adminToken?: string;
  message?: string;
}

/**
 * Create a new room with a generated code and admin token
 * Note: This is a standalone async function, not a hook
 */
export async function createRoom(actor: any): Promise<RoomResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    const code = generateRoomCode();
    const adminToken = generateAdminToken();
    const hostId = BigInt(Math.floor(Math.random() * 1000000)); // Temporary host ID
    
    const room = await actor.createRoom(code, hostId, adminToken);
    
    return { ok: true, code: room.code, adminToken: room.adminToken };
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
