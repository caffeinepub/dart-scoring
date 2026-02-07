import { useState, useCallback } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Tv, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import DisplayScoreboard from '../components/rooms/DisplayScoreboard';
import RecentTurnsReadOnly from '../components/rooms/RecentTurnsReadOnly';
import ClaimSeatPanel from '../components/rooms/ClaimSeatPanel';
import { useGameRealtime } from '../hooks/useGameRealtime';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { GameSnapshot } from '../lib/realtimeEventEnvelope';

export default function RoomDisplayTvPage() {
  const navigate = useNavigate();
  const { roomCode } = useParams({ from: '/room/$roomCode/display' });
  const [gameSnapshot, setGameSnapshot] = useState<GameSnapshot | null>(null);
  const { identity, isLoginSuccess } = useInternetIdentity();

  const handleGameSnapshot = useCallback((snapshot: GameSnapshot) => {
    setGameSnapshot(snapshot);
  }, []);

  // Connect to realtime for this room's game
  // Note: We'll use roomCode as gameId for now (backend limitation)
  const { connectionState, isConnected, isFallback, reconnect } = useGameRealtime({
    gameId: roomCode,
    onGameSnapshot: handleGameSnapshot,
    enabled: true,
  });

  const handleClaimSuccess = () => {
    // Trigger a refresh by reconnecting
    if (reconnect) {
      reconnect();
    }
  };

  const handleBackToStart = () => {
    navigate({ to: '/' });
  };

  const getConnectionBadge = () => {
    if (isConnected) {
      return (
        <Badge variant="default" className="gap-1">
          <Wifi className="h-3 w-3" />
          Connected
        </Badge>
      );
    }
    if (isFallback) {
      return (
        <Badge variant="secondary" className="gap-1">
          <WifiOff className="h-3 w-3" />
          Fallback Mode
        </Badge>
      );
    }
    if (connectionState === 'connecting') {
      return (
        <Badge variant="outline" className="gap-1">
          Connecting...
        </Badge>
      );
    }
    if (connectionState === 'error') {
      return (
        <Badge variant="destructive" className="gap-1">
          <WifiOff className="h-3 w-3" />
          Connection Error
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between pt-6">
        <Button
          onClick={handleBackToStart}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Start
        </Button>
        <div className="flex items-center gap-3">
          {getConnectionBadge()}
          <div className="text-sm text-muted-foreground">
            Room: <span className="font-mono font-bold">{roomCode}</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <Tv className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Display / TV</h2>
        <p className="text-lg text-muted-foreground">
          Read-only scoreboard view
        </p>
      </div>

      {!isConnected && !gameSnapshot && (
        <Alert>
          <AlertDescription>
            {connectionState === 'connecting' && 'Connecting to game...'}
            {connectionState === 'error' && 'Unable to connect. Please check your connection.'}
            {isFallback && 'Running in fallback mode. Real-time updates unavailable.'}
          </AlertDescription>
        </Alert>
      )}

      {gameSnapshot && (
        <div className="space-y-6">
          <DisplayScoreboard snapshot={gameSnapshot} />
          
          {gameSnapshot.game.status !== 'completed' && (
            <ClaimSeatPanel
              snapshot={gameSnapshot}
              isAuthenticated={isLoginSuccess}
              onClaimSuccess={handleClaimSuccess}
            />
          )}
          
          <RecentTurnsReadOnly snapshot={gameSnapshot} />
        </div>
      )}

      {!gameSnapshot && isConnected && (
        <Alert>
          <AlertDescription>
            Waiting for game to start...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
