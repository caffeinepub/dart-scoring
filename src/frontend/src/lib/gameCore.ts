// UI-agnostic game core module with pure state transition functions

import type { GameSettings } from './gameSettings';

export type GamePhase = 'in-progress' | 'awaiting-confirmation' | 'game-over';

export interface Player {
  name: string;
  remaining: number;
}

export interface Turn {
  turnNumber: number;
  playerIndex: number;
  playerName: string;
  scoredPoints: number;
  remainingAfter: number;
  isBust: boolean;
  needsDoubleConfirmation: boolean;
  isConfirmedWin: boolean;
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
 * Apply a turn with validation, bust rules, and Double Out behavior
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
  let needsDoubleConfirmation = false;
  let finalRemaining = currentPlayer.remaining;
  let newPhase: GamePhase = 'in-progress';

  // Check bust conditions
  if (newRemaining < 0) {
    // Standard bust: score exceeds remaining
    isBust = true;
  } else if (game.settings.doubleOut && newRemaining === 1) {
    // Double Out bust: cannot finish on 1
    isBust = true;
  } else if (newRemaining === 0) {
    // Exact finish
    if (game.settings.doubleOut) {
      // Double Out ON: needs confirmation
      needsDoubleConfirmation = true;
      newPhase = 'awaiting-confirmation';
      finalRemaining = 0;
    } else {
      // Double Out OFF: immediate win
      finalRemaining = 0;
      newPhase = 'game-over';
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
    scoredPoints,
    remainingAfter: finalRemaining,
    isBust,
    needsDoubleConfirmation,
    isConfirmedWin: newPhase === 'game-over',
    // Snapshot for undo
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
 * Confirm a double finish as valid (YES answer)
 */
export function confirmDoubleFinish(game: Game): Game {
  if (game.phase !== 'awaiting-confirmation') {
    return game;
  }

  const lastTurn = game.turnHistory[game.turnHistory.length - 1];
  
  // Update the last turn to mark it as confirmed win
  const updatedHistory = [...game.turnHistory];
  updatedHistory[updatedHistory.length - 1] = {
    ...lastTurn,
    isConfirmedWin: true,
  };

  return {
    ...game,
    turnHistory: updatedHistory,
    phase: 'game-over',
    winner: {
      playerIndex: lastTurn.playerIndex,
      playerName: lastTurn.playerName,
      turns: game.turnHistory.length,
    },
  };
}

/**
 * Reject a double finish (NO answer) - treat as bust
 */
export function rejectDoubleFinish(game: Game): Game {
  if (game.phase !== 'awaiting-confirmation') {
    return game;
  }

  const lastTurn = game.turnHistory[game.turnHistory.length - 1];
  
  // Restore player's previous remaining (treat as bust)
  const restoredPlayers = game.players.map((player, index) => {
    if (index === lastTurn.playerIndex) {
      return {
        ...player,
        remaining: lastTurn.previousRemaining,
      };
    }
    return player;
  });

  // Update the last turn to mark it as bust
  const updatedHistory = [...game.turnHistory];
  updatedHistory[updatedHistory.length - 1] = {
    ...lastTurn,
    isBust: true,
    needsDoubleConfirmation: false,
    remainingAfter: lastTurn.previousRemaining,
  };

  // Advance to next player
  const nextPlayerIndex = (lastTurn.playerIndex + 1) % game.players.length;

  return {
    ...game,
    players: restoredPlayers,
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: updatedHistory,
    phase: 'in-progress',
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
