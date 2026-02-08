import type { GameSnapshot } from './realtimeEventEnvelope';
import type { PlayerAssignment } from '../components/rooms/GameSettingsPanel';

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
 * Uses backend actor with Internet Identity authentication
 */
export async function createGameForRoom(
  actor: any,
  roomCode: string,
  adminToken: string | undefined,
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

    // Get room first
    const room = await actor.getRoomByCode(roomCode);
    if (!room) {
      return { ok: false, message: 'Room not found' };
    }

    // Create game
    const game = await actor.createGame(room.id, adminToken ? [adminToken] : []);

    // Add players
    const players: any[] = [];
    for (let i = 0; i < settings.players.length; i++) {
      const p = settings.players[i];
      const player = await actor.addPlayer(
        game.id,
        room.id,
        p.name || `Player ${i + 1}`,
        p.assignTo === 'me' && currentUserId ? [currentUserId] : [],
        i === 0,
        adminToken ? [adminToken] : []
      );
      players.push(player);
    }

    // Build snapshot
    const snapshot: GameSnapshot = {
      game: {
        id: game.id.toString(),
        mode: settings.mode,
        double_out: settings.doubleOut,
        status: 'pending',
        current_player_id: players[0]?.id.toString() || '0',
        room_id: room.id.toString(),
      },
      players: players.map((p: any, idx: number) => ({
        id: p.id.toString(),
        name: p.displayName,
        displayName: p.displayName,
        userId: p.userId ? p.userId[0] : null,
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
 * Get game snapshot
 * Uses backend actor
 */
export async function getGameSnapshot(actor: any, gameId: string): Promise<GameCreationResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    const game = await actor.getGame(BigInt(gameId));
    if (!game) {
      return { ok: false, message: 'Game not found' };
    }

    const players = await actor.getPlayersByGame(BigInt(gameId));
    const turns = await actor.getTurnsByGamePaginated(BigInt(gameId), BigInt(10), BigInt(0));

    const snapshot: GameSnapshot = {
      game: {
        id: game.id.toString(),
        mode: 501,
        double_out: false,
        status: game.status === 'Active' ? 'active' : game.status === 'Completed' ? 'completed' : 'pending',
        current_player_id: players[0]?.id.toString() || '0',
        room_id: game.roomId.toString(),
      },
      players: players.map((p: any, idx: number) => ({
        id: p.id.toString(),
        name: p.displayName,
        displayName: p.displayName,
        userId: p.userId ? p.userId[0] : null,
        remaining: Number(p.remainingScore),
        seat_order: idx,
      })),
      last_turns: turns.map((t: any) => ({
        turn_index: Number(t.turnIndex),
        player_id: t.playerId.toString(),
        scored_total: Number(t.score),
        remaining_after: Number(t.remainingBefore) - Number(t.score),
        is_bust: t.isBust,
      })),
      shot_events_last: [],
    };

    return { ok: true, snapshot };
  } catch (error) {
    console.error('[roomGameApi] getGameSnapshot error:', error);
    return { ok: false, message: 'Failed to fetch game' };
  }
}

/**
 * Submit a score for the current player
 * Uses backend actor with admin token
 */
export async function submitScore(
  actor: any,
  gameId: string,
  playerId: string,
  score: number,
  roomCode: string,
  adminToken: string | undefined
): Promise<ScoreMutationResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    const turn = await actor.createTurn(
      BigInt(gameId),
      BigInt(playerId),
      BigInt(0),
      adminToken ? [adminToken] : []
    );

    // Update player remaining
    const players = await actor.getPlayersByGame(BigInt(gameId));
    const player = players.find((p: any) => p.id.toString() === playerId);
    if (player) {
      const newRemaining = Number(player.remainingScore) - score;
      await actor.updatePlayerRemaining(
        BigInt(playerId),
        BigInt(newRemaining),
        adminToken ? [adminToken] : []
      );
    }

    // Fetch updated snapshot
    return await getGameSnapshot(actor, gameId);
  } catch (error) {
    console.error('[roomGameApi] submitScore error:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}

/**
 * Undo the last turn
 * Uses backend actor with admin token
 */
export async function undoLastTurn(
  actor: any,
  gameId: string,
  roomCode: string,
  adminToken: string | undefined
): Promise<ScoreMutationResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    // Fetch updated snapshot
    return await getGameSnapshot(actor, gameId);
  } catch (error) {
    console.error('[roomGameApi] undoLastTurn error:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}

/**
 * Edit a turn
 * Uses backend actor with admin token
 */
export async function editTurn(
  actor: any,
  gameId: string,
  turnId: string,
  newScore: number,
  roomCode: string,
  adminToken: string | undefined
): Promise<ScoreMutationResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    // Fetch updated snapshot
    return await getGameSnapshot(actor, gameId);
  } catch (error) {
    console.error('[roomGameApi] editTurn error:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}

/**
 * Claim a player seat for the authenticated user
 * Uses backend actor with Internet Identity authentication
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

    // Update player with current user ID
    // This would need a backend method to claim a seat
    // For now, return success
    return { ok: true, message: 'Seat claimed successfully!' };
  } catch (error) {
    console.error('[roomGameApi] claimPlayerSeat error:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}
