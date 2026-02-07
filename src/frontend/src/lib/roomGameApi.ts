import type { GameSnapshot } from './realtimeEventEnvelope';

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

/**
 * Parse backend error messages for auth failures
 */
function parseBackendError(error: any): string {
  const errorMessage = error?.message || String(error);
  
  if (errorMessage.includes('Invalid admin token')) {
    return 'Invalid admin token. Please check your scorer token.';
  }
  if (errorMessage.includes('not found')) {
    return errorMessage;
  }
  
  return 'Operation failed. Please try again.';
}

/**
 * Create a game for a room with the given settings
 * Requires admin token for authorization
 * Note: This is a standalone async function, not a hook
 */
export async function createGameForRoom(
  actor: any,
  roomCode: string,
  adminToken: string,
  settings: {
    mode: 301 | 501;
    doubleOut: boolean;
    players: string[];
  }
): Promise<GameCreationResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    if (!adminToken) {
      return { ok: false, message: 'Admin token required. Please enter your scorer token.' };
    }

    // First, get the room by code (read-only, no token needed)
    const room = await actor.getRoomByCode(roomCode);
    if (!room) {
      return { ok: false, message: 'Room not found' };
    }

    // Create a game for this room (mutation, requires token)
    const game = await actor.createGame(room.id);

    // Create a mock snapshot for now (backend doesn't store full game state yet)
    const snapshot: GameSnapshot = {
      gameId: game.id.toString(),
      players: settings.players.map((name) => ({
        name,
        remaining: settings.mode,
      })),
      currentPlayerIndex: 0,
      turnHistory: [],
      phase: 'in-progress',
      winner: null,
    };

    return { ok: true, snapshot };
  } catch (error) {
    console.error('Failed to create game:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}

/**
 * Submit a score/turn for the current player
 * Requires admin token for authorization
 * Note: This is a standalone async function, not a hook
 */
export async function submitScore(
  actor: any,
  roomCode: string,
  adminToken: string,
  gameId: string,
  playerId: string,
  score: number,
  currentSnapshot: GameSnapshot
): Promise<ScoreMutationResult> {
  try {
    if (!actor) {
      return { ok: false, message: 'Backend not available' };
    }

    if (!adminToken) {
      return { ok: false, message: 'Admin token required. Please enter your scorer token.' };
    }

    // Create turn in backend (mutation, requires token)
    const turnIndex = BigInt(currentSnapshot.turnHistory.length);
    await actor.createTurn(BigInt(gameId), BigInt(playerId), turnIndex, roomCode, adminToken);

    // For now, compute the new snapshot locally
    // In a full implementation, the backend would return the authoritative snapshot
    const currentPlayer = currentSnapshot.players[currentSnapshot.currentPlayerIndex];
    const newRemaining = currentPlayer.remaining - score;
    
    let isBust = false;
    let isWin = false;
    
    if (newRemaining < 0 || newRemaining === 1) {
      isBust = true;
    } else if (newRemaining === 0) {
      isWin = true;
    }

    const newPlayers = currentSnapshot.players.map((p, idx) => {
      if (idx === currentSnapshot.currentPlayerIndex) {
        return { ...p, remaining: isBust ? p.remaining : newRemaining };
      }
      return p;
    });

    const newSnapshot: GameSnapshot = {
      ...currentSnapshot,
      players: newPlayers,
      currentPlayerIndex: isWin ? currentSnapshot.currentPlayerIndex : (currentSnapshot.currentPlayerIndex + 1) % currentSnapshot.players.length,
      turnHistory: [
        ...currentSnapshot.turnHistory,
        {
          turnNumber: currentSnapshot.turnHistory.length + 1,
          playerIndex: currentSnapshot.currentPlayerIndex,
          playerName: currentPlayer.name,
          scoredPoints: isBust ? 0 : score,
          remainingAfter: isBust ? currentPlayer.remaining : newRemaining,
          isBust,
          isConfirmedWin: isWin,
          darts: [],
          turnTotal: score,
        },
      ],
      phase: isWin ? 'game-over' : 'in-progress',
      winner: isWin ? {
        playerIndex: currentSnapshot.currentPlayerIndex,
        playerName: currentPlayer.name,
        turns: currentSnapshot.turnHistory.length + 1,
      } : null,
    };

    return { ok: true, snapshot: newSnapshot };
  } catch (error) {
    console.error('Failed to submit score:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}

/**
 * Undo the last turn
 * Note: This is a local operation for now (no backend mutation)
 */
export async function undoLastTurn(
  currentSnapshot: GameSnapshot
): Promise<ScoreMutationResult> {
  try {
    if (currentSnapshot.turnHistory.length === 0) {
      return { ok: false, message: 'No turns to undo' };
    }

    const lastTurn = currentSnapshot.turnHistory[currentSnapshot.turnHistory.length - 1];
    
    // Restore player's previous remaining
    const restoredPlayers = currentSnapshot.players.map((p, idx) => {
      if (idx === lastTurn.playerIndex) {
        return { ...p, remaining: p.remaining + lastTurn.scoredPoints };
      }
      return p;
    });

    const newSnapshot: GameSnapshot = {
      ...currentSnapshot,
      players: restoredPlayers,
      currentPlayerIndex: lastTurn.playerIndex,
      turnHistory: currentSnapshot.turnHistory.slice(0, -1),
      phase: 'in-progress',
      winner: null,
    };

    return { ok: true, snapshot: newSnapshot };
  } catch (error) {
    console.error('Failed to undo turn:', error);
    return { ok: false, message: 'Failed to undo turn' };
  }
}

/**
 * Edit the last turn
 * Requires admin token for authorization
 */
export async function editLastTurn(
  actor: any,
  roomCode: string,
  adminToken: string,
  newScore: number,
  currentSnapshot: GameSnapshot
): Promise<ScoreMutationResult> {
  try {
    // Undo then resubmit with new score
    const undoResult = await undoLastTurn(currentSnapshot);
    if (!undoResult.ok || !undoResult.snapshot) {
      return undoResult;
    }

    const playerId = currentSnapshot.turnHistory[currentSnapshot.turnHistory.length - 1].playerIndex.toString();
    return await submitScore(actor, roomCode, adminToken, currentSnapshot.gameId, playerId, newScore, undoResult.snapshot);
  } catch (error) {
    console.error('Failed to edit turn:', error);
    return { ok: false, message: parseBackendError(error) };
  }
}
