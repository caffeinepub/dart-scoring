/**
 * Realtime transport abstraction for game events.
 * 
 * PLATFORM LIMITATION: The Internet Computer does not support traditional WebSocket
 * connections in Motoko canisters. This implementation provides a documented fallback
 * strategy that preserves the same event envelope semantics.
 * 
 * FALLBACK STRATEGY:
 * - Attempts to establish a WebSocket connection to /ws/games/{game_id}
 * - If WebSocket is unavailable or fails, falls back to a no-op mode
 * - The app remains functional using existing non-realtime flows
 * - Developer-facing warnings are logged when fallback is active
 */

import { parseRealtimeEvent, type RealtimeEventEnvelope } from './realtimeEventEnvelope';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error' | 'fallback';

export type RealtimeEventHandler = (event: RealtimeEventEnvelope) => void;

export interface RealtimeTransportConfig {
  gameId: string;
  onEvent: RealtimeEventHandler;
  onStateChange?: (state: ConnectionState) => void;
}

export class RealtimeTransport {
  private ws: WebSocket | null = null;
  private config: RealtimeTransportConfig;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private baseReconnectDelay = 1000;

  constructor(config: RealtimeTransportConfig) {
    this.config = config;
  }

  /**
   * Connect to the game channel
   */
  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.setState('connecting');
    this.attemptWebSocketConnection();
  }

  /**
   * Disconnect from the game channel
   */
  disconnect(): void {
    this.cleanup();
    this.setState('disconnected');
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  private attemptWebSocketConnection(): void {
    try {
      // Construct WebSocket URL
      // Note: This will fail on Internet Computer as WebSockets are not supported
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/games/${this.config.gameId}`;

      console.log('[RealtimeTransport] Attempting WebSocket connection to:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[RealtimeTransport] WebSocket connected');
        this.reconnectAttempts = 0;
        this.setState('connected');
      };

      this.ws.onmessage = (event) => {
        const parsed = parseRealtimeEvent(event.data);
        if (parsed) {
          this.config.onEvent(parsed);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('[RealtimeTransport] WebSocket error:', error);
        this.handleConnectionError();
      };

      this.ws.onclose = () => {
        console.log('[RealtimeTransport] WebSocket closed');
        this.handleConnectionClosed();
      };
    } catch (error) {
      console.warn('[RealtimeTransport] Failed to create WebSocket:', error);
      this.handleConnectionError();
    }
  }

  private handleConnectionError(): void {
    this.cleanup();

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      console.warn(
        '[RealtimeTransport] Max reconnection attempts reached. Falling back to non-realtime mode.',
        'The app will continue to function using existing flows.'
      );
      this.setState('fallback');
    }
  }

  private handleConnectionClosed(): void {
    this.cleanup();

    if (this.state !== 'disconnected' && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(
      `[RealtimeTransport] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimeout = window.setTimeout(() => {
      this.attemptWebSocketConnection();
    }, delay);
  }

  private cleanup(): void {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      
      this.ws = null;
    }

    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.config.onStateChange?.(newState);
    }
  }
}
