/**
 * Game statistics computation utility
 * Computes per-player metrics from Game state
 */

import type { Game, Turn } from './gameCore';

export interface PlayerStats {
  playerName: string;
  playerIndex: number;
  avg: number; // Average per 3 darts
  first9Avg: number | null; // First 9 darts average (null if not enough data)
  count180s: number; // Number of 180s
  checkoutPercent: number | null; // Checkout % (null if Double Out OFF or no attempts)
  busts: number; // Number of busts
}

/**
 * Compute per-player statistics from game state
 * @param game - Current game state
 * @returns Array of player statistics
 */
export function computeGameStats(game: Game): PlayerStats[] {
  const playerStats: PlayerStats[] = game.players.map((player, index) => ({
    playerName: player.name,
    playerIndex: index,
    avg: 0,
    first9Avg: null,
    count180s: 0,
    checkoutPercent: null,
    busts: 0,
  }));

  // Group turns by player
  const turnsByPlayer: Record<number, Turn[]> = {};
  game.players.forEach((_, index) => {
    turnsByPlayer[index] = [];
  });

  game.turnHistory.forEach((turn) => {
    turnsByPlayer[turn.playerIndex].push(turn);
  });

  // Compute stats for each player
  game.players.forEach((_, playerIndex) => {
    const turns = turnsByPlayer[playerIndex];
    const stats = playerStats[playerIndex];

    if (turns.length === 0) {
      return; // No turns for this player
    }

    // Compute average per 3 darts
    // Sum all scored points (excluding bust turns where scoredPoints = 0)
    const totalPoints = turns.reduce((sum, turn) => sum + turn.scoredPoints, 0);
    const totalTurns = turns.length;
    stats.avg = totalTurns > 0 ? totalPoints / totalTurns : 0;

    // Compute first 9 average (first 3 turns)
    const first3Turns = turns.slice(0, 3);
    if (first3Turns.length > 0) {
      const first9Points = first3Turns.reduce((sum, turn) => sum + turn.scoredPoints, 0);
      stats.first9Avg = first9Points / first3Turns.length;
    }

    // Count 180s (turns where turnTotal = 180 and not a bust)
    stats.count180s = turns.filter((turn) => turn.turnTotal === 180 && !turn.isBust).length;

    // Count busts
    stats.busts = turns.filter((turn) => turn.isBust).length;

    // Compute checkout % if Double Out is ON
    if (game.settings.doubleOut) {
      // Checkout attempts: turns where the player had a chance to finish
      // (remaining before turn was <= 170 and > 1, or exactly finished)
      // Successful checkouts: turns where isConfirmedWin is true
      
      const checkoutAttempts = turns.filter((turn) => {
        // A checkout attempt is when:
        // 1. The player finished (isConfirmedWin = true), OR
        // 2. The player had a finishable score (previousRemaining <= 170 and > 1) but didn't finish
        const hadFinishableScore = turn.previousRemaining <= 170 && turn.previousRemaining > 1;
        return turn.isConfirmedWin || (hadFinishableScore && turn.previousRemaining - turn.scoredPoints !== 0);
      });

      const successfulCheckouts = turns.filter((turn) => turn.isConfirmedWin).length;

      if (checkoutAttempts.length > 0) {
        stats.checkoutPercent = (successfulCheckouts / checkoutAttempts.length) * 100;
      } else {
        stats.checkoutPercent = 0;
      }
    }
  });

  return playerStats;
}
