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

/**
 * Canonical Game Snapshot Contract
 * This structure matches the backend snapshot schema and is used for all
 * game state synchronization between backend, realtime events, and frontend UI.
 */
export interface GameSnapshot {
  game: {
    id: string;
    mode: 301 | 501;
    double_out: boolean;
    status: 'pending' | 'active' | 'completed';
    current_player_id: string;
    room_id?: string;
    started_at?: number;
    finished_at?: number;
    winner_player_id?: string;
  };
  players: Array<{
    id: string;
    name: string;
    displayName?: string;
    userId?: string | null;
    remaining: number;
    seat_order: number;
    stats?: {
      avg_per_3_darts?: number;
      first_9_avg?: number;
      count_180s?: number;
      checkout_percentage?: number;
      busts_count?: number;
    };
  }>;
  last_turns: Array<{
    id: string;
    turn_index: number;
    player_id: string;
    scored_total: number;
    turn_total: number;
    is_bust: boolean;
    is_win: boolean;
    remaining_before: number;
    remaining_after: number;
    darts?: Array<{
      mult: string;
      value: number;
    }>;
    finish_dart?: string;
  }>;
  shot_events_last: Array<{
    id: string;
    timestamp: number;
    source: 'manual' | 'voice' | 'camera';
    status: 'proposed' | 'accepted' | 'rejected';
    proposed_total?: number;
    proposed_darts?: Array<{
      mult: string;
      value: number;
    }>;
  }>;
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
