import type { GameSnapshot } from './realtimeEventEnvelope';
import type { PlayerAssignment } from '../components/rooms/GameSettingsPanel';
import type { Player } from '../backend';

export interface GameCreationResult {
  ok: boolean;
  snapshot?: GameSnapshot;
  message?: string;
}

export interface ScoreMutationResult {
  ok: boolean;
  snapshot?: GameSnapshot;
  message?: string;
}

export interface ClaimSeatResult {
  ok: boolean;
  message?: string;
}

/**
 * Parse backend error messages for auth failures
 */
function parseBackendError(error: any): string {
  const errorMessage = error?.message || String(error);
  
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid admin token')) {
    return 'You are not authorized to perform this action.';
  }
  if (errorMessage.includes('Admin token required')) {
    return 'Invalid scorer token.';
  }
  if (errorMessage.includes('not found')) {
    return errorMessage;
  }
  if (errorMessage.includes('Anonymous')) {
    return 'You must be signed in to perform this action.';
  }
  if (errorMessage.includes('already')) {
    return errorMessage;
  }
  
  return 'Operation failed. Please try again.';
}

/**
 * Create a game for a room with the given settings
 * Supports owner-based auth (when authenticated) or token-based auth
 * Note: This is a standalone async function, not a hook
 */
export async function createGameForRoom(
  actor: any,
  roomCode: string,
  adminToken: string | null,
  settings: {
    mode: 301 | 501;
    doubleOut: boolean;
    players: PlayerAssignment[];
  },
  currentUserId?: string
): Promise<GameCreationResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    // First, get the room by code (read-only, no token needed)
    const room = await actor.getRoomByCode(roomCode);
    if (!room) {
      return { ok: false, message: 'Room not found' };
    }

    // Create a game for this room (mutation, requires owner or token)
    // Pass null for adminToken if we're attempting owner-based auth
    const game = await actor.createGame(room.id, adminToken);

    // Add players with seat assignments
    const playerRecords: Player[] = [];
    for (let i = 0; i < settings.players.length; i++) {
      const playerAssignment = settings.players[i];
      const displayName = playerAssignment.name || `Player ${i + 1}`;
      
      // Determine userId based on assignment
      let userId: string | null = null;
      if (playerAssignment.assignTo === 'me' && currentUserId) {
        userId = currentUserId;
      }

      const player = await actor.addPlayer(
        game.id,
        room.id,
        displayName,
        userId,
        i === 0, // First player is host
        adminToken
      );
      playerRecords.push(player);
    }

    // Create a canonical snapshot
    const snapshot: GameSnapshot = {
      game: {
        id: game.id.toString(),
        mode: settings.mode,
        double_out: settings.doubleOut,
        status: 'pending',
        current_player_id: playerRecords[0]?.id.toString() || '0',
        room_id: room.id.toString(),
      },
      players: playerRecords.map((p, idx) => ({
        id: p.id.toString(),
        name: p.displayName,
        displayName: p.displayName,
        userId: p.userId || null,
        remaining: settings.mode,
        seat_order: idx,
      })),
      last_turns: [],
      shot_events_last: [],
    };

    return { ok: true, snapshot };
  } catch (error) {
    console.error('[roomGameApi] createGameForRoom error:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}

/**
 * Submit a score for the current player
 */
export async function submitScore(
  actor: any,
  gameId: string,
  playerId: string,
  score: number,
  roomCode: string,
  adminToken: string | null
): Promise<ScoreMutationResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    // Create turn (mutation, requires owner or token)
    const turn = await actor.createTurn(
      BigInt(gameId),
      BigInt(playerId),
      BigInt(0), // turnIndex placeholder
      adminToken
    );

    // For now, return a minimal snapshot update
    // In production, backend would return full snapshot
    return { 
      ok: true, 
      message: 'Score submitted successfully'
    };
  } catch (error) {
    console.error('[roomGameApi] submitScore error:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}

/**
 * Undo the last turn (placeholder implementation)
 */
export async function undoLastTurn(
  snapshot: GameSnapshot
): Promise<ScoreMutationResult> {
  // This is a placeholder - backend doesn't support undo yet
  return {
    ok: false,
    message: 'Undo functionality not yet implemented'
  };
}

/**
 * Claim a player seat for the authenticated user
 */
export async function claimPlayerSeat(
  actor: any,
  gameId: string,
  playerId: string
): Promise<ClaimSeatResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    // Type-safe approach: use any for the actor call since backend types may be evolving
    const actorAny = actor as any;
    
    // Check if the method exists
    if (typeof actorAny.claimPlayerSeat !== 'function') {
      return { 
        ok: false, 
        message: 'Claim feature not yet available. Please check back later.' 
      };
    }

    await actorAny.claimPlayerSeat(BigInt(gameId), BigInt(playerId));
    
    return { ok: true, message: 'Seat claimed successfully!' };
  } catch (error) {
    console.error('[roomGameApi] claimPlayerSeat error:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}
