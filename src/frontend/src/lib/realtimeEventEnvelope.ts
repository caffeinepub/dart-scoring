/**
 * Realtime event envelope definitions and parsing utilities.
 * Defines the event types and payload structures for game realtime updates.
 */

export type RealtimeEventType = 
  | 'GAME_SNAPSHOT'
  | 'TURN_ADDED'
  | 'TURN_UNDONE'
  | 'TURN_EDITED';

export interface RealtimeEventEnvelope<T = unknown> {
  type: RealtimeEventType;
  payload: T;
}

export interface GameSnapshot {
  gameId: string;
  players: Array<{
    name: string;
    remaining: number;
  }>;
  currentPlayerIndex: number;
  turnHistory: Array<{
    turnNumber: number;
    playerIndex: number;
    playerName: string;
    scoredPoints: number;
    remainingAfter: number;
    isBust: boolean;
    isConfirmedWin: boolean;
    darts: Array<{
      mult: string;
      value: number;
    }>;
    turnTotal: number;
    finishDart?: string;
  }>;
  phase: 'in-progress' | 'game-over';
  winner: {
    playerIndex: number;
    playerName: string;
    turns: number;
  } | null;
}

/**
 * Parse and validate a JSON message as a realtime event envelope.
 * Returns null if the message is not a valid envelope.
 */
export function parseRealtimeEvent(data: string): RealtimeEventEnvelope | null {
  try {
    const parsed = JSON.parse(data);
    
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    
    if (!parsed.type || typeof parsed.type !== 'string') {
      return null;
    }
    
    const validTypes: RealtimeEventType[] = [
      'GAME_SNAPSHOT',
      'TURN_ADDED',
      'TURN_UNDONE',
      'TURN_EDITED'
    ];
    
    if (!validTypes.includes(parsed.type as RealtimeEventType)) {
      return null;
    }
    
    return {
      type: parsed.type as RealtimeEventType,
      payload: parsed.payload
    };
  } catch (error) {
    console.warn('[RealtimeEvent] Failed to parse event:', error);
    return null;
  }
}

/**
 * Type guard for GAME_SNAPSHOT events
 */
export function isGameSnapshotEvent(
  event: RealtimeEventEnvelope
): event is RealtimeEventEnvelope<GameSnapshot> {
  return event.type === 'GAME_SNAPSHOT';
}
