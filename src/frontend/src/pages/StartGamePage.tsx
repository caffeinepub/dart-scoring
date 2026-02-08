import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Play, UserPlus, X, Users, Tv, Lock, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { saveGameSettings, sanitizePlayerNames } from '../lib/gameSettings';
import { setAdminToken } from '../lib/adminTokenStorage';
import { useSession } from '../hooks/useSession';
import { useActor } from '../hooks/useActor';
import RoomCodeDisplay from '../components/rooms/RoomCodeDisplay';

export default function StartGamePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const { actor } = useActor();
  const [mode, setMode] = useState<301 | 501>(501);
  const [doubleOut, setDoubleOut] = useState(false);
  const [players, setPlayers] = useState(['', '']);

  // Multi-device state
  const [multiDeviceMode, setMultiDeviceMode] = useState<'none' | 'create' | 'join'>('none');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [createdWithAccount, setCreatedWithAccount] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [isCreatingWithAccount, setIsCreatingWithAccount] = useState(false);
  const [isCreatingWithoutAccount, setIsCreatingWithoutAccount] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, '']);
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const handlePlayerNameChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    const sanitizedPlayers = sanitizePlayerNames(players);
    saveGameSettings({
      mode,
      doubleOut,
      players: sanitizedPlayers,
    });
    navigate({ to: '/game', search: {} });
  };

  const handleCreateRoom = async (withAccount: boolean) => {
    if (withAccount) {
      setIsCreatingWithAccount(true);
    } else {
      setIsCreatingWithoutAccount(true);
    }
    setError(null);

    try {
      if (!actor) {
        throw new Error('Backend actor not available');
      }

      // Generate room code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const hostId = 'host_' + Date.now();

      const result = await actor.createRoomV2(code, hostId, withAccount);

      if (result.__kind__ === 'error') {
        setError(result.error.message || 'Failed to create room');
        return;
      }

      const { room, admin_token } = result.success;

      // Store admin token if provided (no-account room)
      if (admin_token) {
        setAdminToken(room.code, admin_token);
      }

      setCreatedRoomCode(room.code);
      setCreatedWithAccount(withAccount);
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setError(err.message || 'Failed to create room. Please try again.');
    } finally {
      setIsCreatingWithAccount(false);
      setIsCreatingWithoutAccount(false);
    }
  };

  const handleJoinRoom = async () => {
    setIsJoiningRoom(true);
    setError(null);

    try {
      if (!actor) {
        throw new Error('Backend actor not available');
      }

      const room = await actor.getRoomByCode(joinRoomCode.toUpperCase().trim());

      if (!room) {
        setError('Room not found. Please check the code.');
        return;
      }

      // Navigate to display page
      navigate({ to: `/room/${room.code}/display` });
    } catch (err: any) {
      console.error('Failed to join room:', err);
      setError(err.message || 'Failed to join room. Please try again.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleGoToHost = () => {
    if (createdRoomCode) {
      navigate({ to: `/room/${createdRoomCode}/host` });
    }
  };

  const handleGoToDisplay = () => {
    if (createdRoomCode) {
      navigate({ to: `/room/${createdRoomCode}/display` });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Start a Game</h1>
        <p className="text-muted-foreground">Choose how you want to play</p>
      </div>

      {/* Single Device Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Single Device
          </CardTitle>
          <CardDescription>Play on this device only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Game Mode</Label>
            <RadioGroup value={mode.toString()} onValueChange={(v) => setMode(Number(v) as 301 | 501)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="301" id="mode-301" />
                <Label htmlFor="mode-301" className="font-normal cursor-pointer">
                  301
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="501" id="mode-501" />
                <Label htmlFor="mode-501" className="font-normal cursor-pointer">
                  501
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="double-out">Double Out</Label>
            <Switch id="double-out" checked={doubleOut} onCheckedChange={setDoubleOut} />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Players ({players.length}/4)</Label>
            {players.map((player, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Player ${index + 1}`}
                  value={player}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                />
                {players.length > 1 && (
                  <Button variant="outline" size="icon" onClick={() => handleRemovePlayer(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {players.length < 4 && (
              <Button variant="outline" onClick={handleAddPlayer} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Player
              </Button>
            )}
          </div>

          <Button onClick={handleStartGame} className="w-full" size="lg">
            <Play className="mr-2 h-4 w-4" />
            Start Game
          </Button>
        </CardContent>
      </Card>

      {/* Multi-Device Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multi-Device
          </CardTitle>
          <CardDescription>Use multiple devices for scoring and display</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {multiDeviceMode === 'none' && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setMultiDeviceMode('create')} className="h-auto py-4">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Create Room</span>
                </div>
              </Button>
              <Button variant="outline" onClick={() => setMultiDeviceMode('join')} className="h-auto py-4">
                <div className="flex flex-col items-center gap-2">
                  <Tv className="h-5 w-5" />
                  <span>Join Room</span>
                </div>
              </Button>
            </div>
          )}

          {multiDeviceMode === 'create' && !createdRoomCode && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => handleCreateRoom(true)}
                  disabled={isCreatingWithAccount || isCreatingWithoutAccount || !isAuthenticated}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingWithAccount ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Create with Account
                    </>
                  )}
                </Button>

                {!isAuthenticated && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Sign in to create a room with your account.{' '}
                      <button
                        onClick={() => navigate({ to: '/login' })}
                        className="underline font-medium hover:text-foreground"
                      >
                        Sign in now
                      </button>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => handleCreateRoom(false)}
                  disabled={isCreatingWithAccount || isCreatingWithoutAccount}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isCreatingWithoutAccount ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Create without account
                    </>
                  )}
                </Button>
              </div>

              <Button variant="ghost" onClick={() => setMultiDeviceMode('none')} className="w-full">
                Back
              </Button>
            </div>
          )}

          {multiDeviceMode === 'create' && createdRoomCode && (
            <div className="space-y-4">
              <RoomCodeDisplay code={createdRoomCode} />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createdWithAccount
                    ? 'Room created with your account. You can manage it from any device where you are signed in.'
                    : 'Room created. Keep this code safe - you will need it to manage the game.'}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleGoToHost} className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Host / Scorer
                </Button>
                <Button onClick={handleGoToDisplay} variant="outline" className="w-full">
                  <Tv className="mr-2 h-4 w-4" />
                  Display / TV
                </Button>
              </div>

              <Button variant="ghost" onClick={() => {
                setCreatedRoomCode(null);
                setMultiDeviceMode('none');
              }} className="w-full">
                Create Another Room
              </Button>
            </div>
          )}

          {multiDeviceMode === 'join' && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="join-code">Room Code</Label>
                <Input
                  id="join-code"
                  placeholder="Enter 6-character code"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>

              <Button
                onClick={handleJoinRoom}
                disabled={joinRoomCode.length !== 6 || isJoiningRoom}
                className="w-full"
                size="lg"
              >
                {isJoiningRoom ? 'Joining...' : 'Join Room'}
              </Button>

              <Button variant="ghost" onClick={() => setMultiDeviceMode('none')} className="w-full">
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
