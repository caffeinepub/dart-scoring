/**
 * React hook for game realtime event subscription.
 * Manages WebSocket connection lifecycle and delivers GAME_SNAPSHOT events.
 */

import { useEffect, useRef, useState } from 'react';
import { RealtimeTransport, type ConnectionState } from '../lib/realtimeTransport';
import { isGameSnapshotEvent, type GameSnapshot } from '../lib/realtimeEventEnvelope';

export interface UseGameRealtimeConfig {
  gameId: string | null;
  onGameSnapshot: (snapshot: GameSnapshot) => void;
  enabled?: boolean;
}

export interface UseGameRealtimeResult {
  connectionState: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  isError: boolean;
  isFallback: boolean;
}

/**
 * Hook to connect to game realtime events and receive snapshots.
 * Automatically connects/disconnects based on gameId changes.
 */
export function useGameRealtime(config: UseGameRealtimeConfig): UseGameRealtimeResult {
  const { gameId, onGameSnapshot, enabled = true } = config;
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const transportRef = useRef<RealtimeTransport | null>(null);

  useEffect(() => {
    // Don't connect if disabled or no gameId
    if (!enabled || !gameId) {
      return;
    }

    // Create transport
    const transport = new RealtimeTransport({
      gameId,
      onEvent: (event) => {
        if (isGameSnapshotEvent(event)) {
          onGameSnapshot(event.payload);
        }
        // Lightweight events (TURN_ADDED, etc.) are ignored for now
        // as snapshots provide complete state
      },
      onStateChange: (state) => {
        setConnectionState(state);
      },
    });

    transportRef.current = transport;
    transport.connect();

    // Cleanup on unmount or gameId change
    return () => {
      transport.disconnect();
      transportRef.current = null;
    };
  }, [gameId, enabled, onGameSnapshot]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isError: connectionState === 'error',
    isFallback: connectionState === 'fallback',
  };
}
