// UI-agnostic game core module with pure state transition functions

import type { GameSettings } from './gameSettings';

export type GamePhase = 'in-progress' | 'game-over';

export interface Player {
  name: string;
  remaining: number;
}

export type DartMultiplier = 'S' | 'D' | 'T' | 'OB' | 'B';

export interface Dart {
  mult: DartMultiplier;
  value: number;
}

export interface Turn {
  turnNumber: number;
  playerIndex: number;
  playerName: string;
  scoredPoints: number;
  remainingAfter: number;
  isBust: boolean;
  isConfirmedWin: boolean;
  // Per-dart data
  darts: Dart[];
  turnTotal: number;
  finishDart?: string;
  // Snapshot for undo
  previousRemaining: number;
  previousPlayerIndex: number;
}

export interface Game {
  settings: GameSettings;
  players: Player[];
  currentPlayerIndex: number;
  turnHistory: Turn[];
  phase: GamePhase;
  winner: {
    playerIndex: number;
    playerName: string;
    turns: number;
  } | null;
}

export interface ApplyTurnResult {
  success: boolean;
  error?: string;
  game?: Game;
}

/**
 * Initialize a new game from settings
 */
export function startGame(settings: GameSettings): Game {
  const players: Player[] = settings.players.map((name) => ({
    name,
    remaining: settings.mode,
  }));

  return {
    settings,
    players,
    currentPlayerIndex: 0,
    turnHistory: [],
    phase: 'in-progress',
    winner: null,
  };
}

/**
 * Calculate points for a single dart
 */
function calculateDartPoints(dart: Dart): number {
  if (dart.mult === 'OB') return 25;
  if (dart.mult === 'B') return 50;
  if (dart.mult === 'S') return dart.value;
  if (dart.mult === 'D') return dart.value * 2;
  if (dart.mult === 'T') return dart.value * 3;
  return 0;
}

/**
 * Format a dart as a string (e.g., "T20", "D16", "Bull")
 */
function formatDart(dart: Dart): string {
  if (dart.mult === 'OB') return 'OB';
  if (dart.mult === 'B') return 'Bull';
  return `${dart.mult}${dart.value}`;
}

/**
 * Check if a dart is a valid double-out finish
 */
function isValidDoubleOutFinish(dart: Dart): boolean {
  return dart.mult === 'D' || dart.mult === 'B';
}

/**
 * Apply a turn with 3 darts, sequential scoring, and deterministic Double Out
 */
export function applyThreeDartTurn(game: Game, darts: Dart[]): ApplyTurnResult {
  if (darts.length === 0) {
    return {
      success: false,
      error: 'At least one dart is required',
    };
  }

  if (darts.length > 3) {
    return {
      success: false,
      error: 'Maximum 3 darts per turn',
    };
  }

  const currentPlayer = game.players[game.currentPlayerIndex];
  let remaining = currentPlayer.remaining;
  let isBust = false;
  let isWin = false;
  let finishDart: string | undefined;
  let lastDartIndex = darts.length - 1;

  // Apply darts sequentially
  for (let i = 0; i < darts.length; i++) {
    const dart = darts[i];
    const points = calculateDartPoints(dart);
    const newRemaining = remaining - points;

    // Check bust conditions
    if (newRemaining < 0) {
      // Standard bust: score exceeds remaining
      isBust = true;
      lastDartIndex = i;
      break;
    } else if (game.settings.doubleOut && newRemaining === 1) {
      // Double Out bust: cannot finish on 1
      isBust = true;
      lastDartIndex = i;
      break;
    } else if (newRemaining === 0) {
      // Exact finish
      if (game.settings.doubleOut) {
        // Check if last dart is a valid double-out finish
        if (isValidDoubleOutFinish(dart)) {
          // Valid double-out finish
          isWin = true;
          finishDart = formatDart(dart);
          remaining = 0;
          lastDartIndex = i;
          break;
        } else {
          // Invalid finish (not a double)
          isBust = true;
          lastDartIndex = i;
          break;
        }
      } else {
        // Double Out OFF: immediate win
        isWin = true;
        finishDart = formatDart(dart);
        remaining = 0;
        lastDartIndex = i;
        break;
      }
    } else {
      // Valid dart, continue
      remaining = newRemaining;
    }
  }

  // Calculate turn total
  const turnTotal = darts.reduce((sum, dart) => sum + calculateDartPoints(dart), 0);

  // Determine final remaining
  const finalRemaining = isBust ? currentPlayer.remaining : remaining;

  // Create new players array with updated remaining
  const newPlayers = game.players.map((player, index) => {
    if (index === game.currentPlayerIndex) {
      return {
        ...player,
        remaining: finalRemaining,
      };
    }
    return player;
  });

  // Determine phase
  const newPhase: GamePhase = isWin ? 'game-over' : 'in-progress';

  // Calculate next player index
  const nextPlayerIndex = isWin
    ? game.currentPlayerIndex
    : (game.currentPlayerIndex + 1) % game.players.length;

  // Create turn record
  const turn: Turn = {
    turnNumber: game.turnHistory.length + 1,
    playerIndex: game.currentPlayerIndex,
    playerName: currentPlayer.name,
    scoredPoints: isBust ? 0 : turnTotal,
    remainingAfter: finalRemaining,
    isBust,
    isConfirmedWin: isWin,
    darts: darts.slice(0, lastDartIndex + 1),
    turnTotal,
    finishDart,
    previousRemaining: currentPlayer.remaining,
    previousPlayerIndex: game.currentPlayerIndex,
  };

  // Create winner info if game over
  const winner = isWin ? {
    playerIndex: game.currentPlayerIndex,
    playerName: currentPlayer.name,
    turns: game.turnHistory.length + 1,
  } : null;

  // Create new game state
  const newGame: Game = {
    ...game,
    players: newPlayers,
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...game.turnHistory, turn],
    phase: newPhase,
    winner,
  };

  return {
    success: true,
    game: newGame,
  };
}

/**
 * Apply a turn with total score (legacy mode)
 */
export function applyTurn(game: Game, scoredPoints: number): ApplyTurnResult {
  // Validate score range
  if (scoredPoints < 0 || scoredPoints > 180) {
    return {
      success: false,
      error: 'Score must be between 0 and 180',
    };
  }

  const currentPlayer = game.players[game.currentPlayerIndex];
  const newRemaining = currentPlayer.remaining - scoredPoints;
  
  let isBust = false;
  let finalRemaining = currentPlayer.remaining;
  let newPhase: GamePhase = 'in-progress';
  let isWin = false;

  // Check bust conditions
  if (newRemaining < 0) {
    // Standard bust: score exceeds remaining
    isBust = true;
  } else if (game.settings.doubleOut && newRemaining === 1) {
    // Double Out bust: cannot finish on 1
    isBust = true;
  } else if (newRemaining === 0) {
    // Exact finish - with Double Out, we cannot verify if it was a double
    // So we treat it as a potential win but don't confirm
    if (game.settings.doubleOut) {
      // In total mode with Double Out, we cannot verify the finish
      // Treat as bust to be safe (user should use 3-dart mode for proper validation)
      isBust = true;
    } else {
      // Double Out OFF: immediate win
      finalRemaining = 0;
      newPhase = 'game-over';
      isWin = true;
    }
  } else {
    // Valid score
    finalRemaining = newRemaining;
  }

  // Create new players array with updated remaining
  const newPlayers = game.players.map((player, index) => {
    if (index === game.currentPlayerIndex) {
      return {
        ...player,
        remaining: finalRemaining,
      };
    }
    return player;
  });

  // Calculate next player index (only advance if not game over)
  const nextPlayerIndex = newPhase === 'game-over' 
    ? game.currentPlayerIndex 
    : (game.currentPlayerIndex + 1) % game.players.length;

  // Create turn record
  const turn: Turn = {
    turnNumber: game.turnHistory.length + 1,
    playerIndex: game.currentPlayerIndex,
    playerName: currentPlayer.name,
    scoredPoints: isBust ? 0 : scoredPoints,
    remainingAfter: finalRemaining,
    isBust,
    isConfirmedWin: isWin,
    darts: [],
    turnTotal: scoredPoints,
    previousRemaining: currentPlayer.remaining,
    previousPlayerIndex: game.currentPlayerIndex,
  };

  // Create winner info if game over
  const winner = newPhase === 'game-over' ? {
    playerIndex: game.currentPlayerIndex,
    playerName: currentPlayer.name,
    turns: game.turnHistory.length + 1,
  } : null;

  // Create new game state
  const newGame: Game = {
    ...game,
    players: newPlayers,
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...game.turnHistory, turn],
    phase: newPhase,
    winner,
  };

  return {
    success: true,
    game: newGame,
  };
}

/**
 * Undo the last turn, restoring previous state
 */
export function undoLastTurn(game: Game): Game {
  if (game.turnHistory.length === 0) {
    // No turns to undo
    return game;
  }

  const lastTurn = game.turnHistory[game.turnHistory.length - 1];
  
  // Restore player's previous remaining
  const restoredPlayers = game.players.map((player, index) => {
    if (index === lastTurn.playerIndex) {
      return {
        ...player,
        remaining: lastTurn.previousRemaining,
      };
    }
    return player;
  });

  // Remove last turn from history
  const newHistory = game.turnHistory.slice(0, -1);

  return {
    ...game,
    players: restoredPlayers,
    currentPlayerIndex: lastTurn.previousPlayerIndex,
    turnHistory: newHistory,
    phase: 'in-progress',
    winner: null,
  };
}
