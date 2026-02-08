import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GameSettingsPanel, { type PlayerAssignment } from '../components/rooms/GameSettingsPanel';
import HostLiveScoringPanel from '../components/rooms/HostLiveScoringPanel';
import { createGameForRoom } from '../lib/roomGameApi';
import { getAdminToken, setAdminToken } from '../lib/adminTokenStorage';
import { useSession } from '../hooks/useSession';
import { useActor } from '../hooks/useActor';
import { useMyProfile } from '../hooks/useMyProfile';
import type { GameSnapshot } from '../lib/realtimeEventEnvelope';

export default function RoomHostScorerPage() {
  const navigate = useNavigate();
  const { isAuthenticated, identity } = useSession();
  const { actor } = useActor();
  const { roomCode } = useParams({ from: '/room/$roomCode/host' });
  const [gameCreated, setGameCreated] = useState(false);
  const [gameSnapshot, setGameSnapshot] = useState<GameSnapshot | null>(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Admin token management
  const [adminToken, setAdminTokenState] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInputValue, setTokenInputValue] = useState('');

  // Current user state - use principal ID directly
  const currentUserId = isAuthenticated && identity ? identity.getPrincipal().toString() : undefined;

  // Fetch user profile for username
  const { data: userProfile } = useMyProfile();

  // Load admin token on mount
  useEffect(() => {
    const storedToken = getAdminToken(roomCode);
    if (storedToken) {
      setAdminTokenState(storedToken);
    }
  }, [roomCode]);

  const handleCreateGame = async (settings: {
    mode: 301 | 501;
    doubleOut: boolean;
    players: PlayerAssignment[];
  }) => {
    setIsCreatingGame(true);
    setError(null);

    try {
      const result = await createGameForRoom(
        actor,
        roomCode,
        adminToken || undefined,
        settings,
        currentUserId
      );

      if (result.ok && result.snapshot) {
        setGameSnapshot(result.snapshot);
        setGameCreated(true);
      } else {
        // Check if it's an auth error
        if (result.message?.includes('not authorized') || result.message?.includes('Invalid scorer token')) {
          setShowTokenInput(true);
          setError(result.message);
        } else {
          setError(result.message || 'Failed to create game');
        }
      }
    } catch (err) {
      setError('Failed to create game. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleTokenSubmit = () => {
    if (tokenInputValue.trim()) {
      setAdminToken(roomCode, tokenInputValue.trim());
      setAdminTokenState(tokenInputValue.trim());
      setShowTokenInput(false);
      setTokenInputValue('');
      setError(null);
    }
  };

  const handleSnapshotUpdate = (newSnapshot: GameSnapshot) => {
    setGameSnapshot(newSnapshot);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (gameCreated && gameSnapshot) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <div className="flex items-center justify-between pt-4">
          <Button
            onClick={() => navigate({ to: '/' })}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Start
          </Button>
          <div className="text-sm text-muted-foreground">
            Room: <span className="font-mono font-bold">{roomCode}</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <HostLiveScoringPanel
          snapshot={gameSnapshot}
          roomCode={roomCode}
          adminToken={adminToken || undefined}
          onSnapshotUpdate={handleSnapshotUpdate}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between pt-4">
        <Button
          onClick={() => navigate({ to: '/' })}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Start
        </Button>
        <div className="text-sm text-muted-foreground">
          Room: <span className="font-mono font-bold">{roomCode}</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Host / Scorer</h2>
        <p className="text-muted-foreground">
          Configure game settings and start scoring
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showTokenInput && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Scorer Token Required
            </CardTitle>
            <CardDescription>
              Enter the scorer token to manage this room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="token-input">Scorer Token</Label>
              <Input
                id="token-input"
                type="text"
                placeholder="Enter scorer token"
                value={tokenInputValue}
                onChange={(e) => setTokenInputValue(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button
              onClick={handleTokenSubmit}
              disabled={!tokenInputValue.trim()}
              className="w-full"
            >
              Submit Token
            </Button>
          </CardContent>
        </Card>
      )}

      <GameSettingsPanel
        onCreateGame={handleCreateGame}
        isCreating={isCreatingGame}
        canAssignMe={isAuthenticated}
        currentUsername={userProfile?.username}
      />
    </div>
  );
}
