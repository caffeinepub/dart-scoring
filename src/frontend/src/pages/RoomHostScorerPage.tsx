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
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { GameSnapshot } from '../lib/realtimeEventEnvelope';

export default function RoomHostScorerPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
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
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const currentUserId = isAuthenticated ? identity?.getPrincipal().toString() : undefined;

  // Load admin token on mount
  useEffect(() => {
    const storedToken = getAdminToken(roomCode);
    if (storedToken) {
      setAdminTokenState(storedToken);
    }
    // Don't show token input immediately - try owner path first if authenticated
  }, [roomCode]);

  const handleSaveToken = () => {
    if (tokenInputValue.trim()) {
      setAdminToken(roomCode, tokenInputValue.trim());
      setAdminTokenState(tokenInputValue.trim());
      setShowTokenInput(false);
      setError(null);
    } else {
      setError('Please enter a valid scorer token');
    }
  };

  const handleCreateGame = async (settings: {
    mode: 301 | 501;
    doubleOut: boolean;
    players: PlayerAssignment[];
  }) => {
    setIsCreatingGame(true);
    setError(null);
    
    try {
      // Try with current token (null if owner path, or stored token)
      const result = await createGameForRoom(actor, roomCode, adminToken, settings, currentUserId);
      
      if (result.ok && result.snapshot) {
        setGameSnapshot(result.snapshot);
        setGameCreated(true);
      } else {
        setError(result.message || 'Failed to create game');
        // If auth error and not authenticated, prompt for token
        if (result.message?.includes('not authorized') || result.message?.includes('Invalid scorer token')) {
          if (!isAuthenticated) {
            setShowTokenInput(true);
          }
        }
      }
    } catch (err) {
      setError('Failed to create game. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleSnapshotUpdate = (snapshot: GameSnapshot) => {
    setGameSnapshot(snapshot);
  };

  const handleBackToStart = () => {
    navigate({ to: '/' });
  };

  if (!gameCreated) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
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
          <div className="text-sm text-muted-foreground">
            Room: <span className="font-mono font-bold">{roomCode}</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Host / Scorer</h2>
          <p className="text-lg text-muted-foreground">
            Configure game settings and start scoring
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Token input section - only show when needed */}
        {showTokenInput && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Scorer Token Required
              </CardTitle>
              <CardDescription>
                Enter your scorer token to manage this game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-input">Scorer Token</Label>
                <Input
                  id="token-input"
                  type="text"
                  placeholder="Enter your scorer token"
                  value={tokenInputValue}
                  onChange={(e) => setTokenInputValue(e.target.value)}
                  className="h-12 font-mono"
                />
              </div>
              <Button
                onClick={handleSaveToken}
                className="w-full"
                disabled={!tokenInputValue.trim()}
              >
                Save Token
              </Button>
            </CardContent>
          </Card>
        )}

        {adminToken && !showTokenInput && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Scorer token is saved on this device.{' '}
              <button
                onClick={() => setShowTokenInput(true)}
                className="underline hover:no-underline"
              >
                Update token
              </button>
            </AlertDescription>
          </Alert>
        )}

        {isAuthenticated && !adminToken && !showTokenInput && (
          <Alert>
            <AlertDescription>
              You are signed in. If you are the room owner, you can create the game without a scorer token.
              {' '}
              <button
                onClick={() => setShowTokenInput(true)}
                className="underline hover:no-underline"
              >
                Or enter a scorer token
              </button>
            </AlertDescription>
          </Alert>
        )}

        <GameSettingsPanel
          onCreateGame={handleCreateGame}
          isCreating={isCreatingGame}
          canAssignMe={isAuthenticated}
          currentUsername={currentUserId ? 'Me' : undefined}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
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
        <div className="text-sm text-muted-foreground">
          Room: <span className="font-mono font-bold">{roomCode}</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Host / Scorer</h2>
        <p className="text-sm text-muted-foreground">
          Enter scores and manage the game
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {gameSnapshot && (
        <HostLiveScoringPanel
          snapshot={gameSnapshot}
          roomCode={roomCode}
          adminToken={adminToken}
          onSnapshotUpdate={handleSnapshotUpdate}
          onError={setError}
        />
      )}
    </div>
  );
}
