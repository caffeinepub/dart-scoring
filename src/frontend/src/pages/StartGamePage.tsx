import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Play, UserPlus, X, Users, Tv, Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { saveGameSettings, sanitizePlayerNames } from '../lib/gameSettings';
import { createRoom, getRoomByCode } from '../lib/roomsApi';
import { setAdminToken } from '../lib/adminTokenStorage';
import { useActor } from '../hooks/useActor';
import RoomCodeDisplay from '../components/rooms/RoomCodeDisplay';

export default function StartGamePage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [mode, setMode] = useState<301 | 501>(501);
  const [doubleOut, setDoubleOut] = useState(false);
  const [players, setPlayers] = useState(['', '']);

  // Multi-device state
  const [multiDeviceMode, setMultiDeviceMode] = useState<'none' | 'create' | 'join'>('none');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinAdminToken, setJoinAdminToken] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
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

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    setError(null);
    try {
      const result = await createRoom(actor);
      if (result.ok && result.code && result.adminToken) {
        // Store the admin token locally
        setAdminToken(result.code, result.adminToken);
        setCreatedRoomCode(result.code);
        setMultiDeviceMode('create');
      } else {
        setError(result.message || 'Failed to create room');
      }
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setIsJoiningRoom(true);
    setError(null);
    try {
      const result = await getRoomByCode(actor, joinRoomCode.trim());
      if (result.ok) {
        // Store the admin token if provided
        if (joinAdminToken.trim()) {
          setAdminToken(joinRoomCode.trim(), joinAdminToken.trim());
        }
        setRoomCode(joinRoomCode.trim());
        setMultiDeviceMode('join');
      } else {
        setError(result.message || 'Failed to join room');
      }
    } catch (err) {
      setError('Failed to join room. Please try again.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleNavigateToHost = () => {
    const code = createdRoomCode || roomCode;
    if (code) {
      navigate({ to: '/room/$roomCode/host', params: { roomCode: code } });
    }
  };

  const handleNavigateToDisplay = () => {
    const code = createdRoomCode || roomCode;
    if (code) {
      navigate({ to: '/room/$roomCode/display', params: { roomCode: code } });
    }
  };

  const handleBackToStart = () => {
    setMultiDeviceMode('none');
    setCreatedRoomCode(null);
    setRoomCode('');
    setJoinRoomCode('');
    setJoinAdminToken('');
    setError(null);
  };

  // Show room navigation after successful create/join
  if (multiDeviceMode === 'create' && createdRoomCode) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-8">
        <div className="text-center space-y-4 pt-8">
          <h2 className="text-4xl font-bold tracking-tight">Room Created</h2>
          <p className="text-lg text-muted-foreground">
            Share this code with other devices
          </p>
        </div>

        <RoomCodeDisplay code={createdRoomCode} />

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Your scorer token has been saved on this device. You can use Host / Scorer to manage the game.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Role</CardTitle>
              <CardDescription>
                Select how you want to use this device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleNavigateToHost}
                className="w-full h-16 text-lg"
                size="lg"
              >
                <Users className="h-6 w-6 mr-3" />
                Host / Scorer
              </Button>
              <Button
                onClick={handleNavigateToDisplay}
                variant="outline"
                className="w-full h-16 text-lg"
                size="lg"
              >
                <Tv className="h-6 w-6 mr-3" />
                Display / TV
              </Button>
            </CardContent>
          </Card>

          <Button
            onClick={handleBackToStart}
            variant="ghost"
            className="w-full"
          >
            Back to Start
          </Button>
        </div>
      </div>
    );
  }

  if (multiDeviceMode === 'join' && roomCode) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-8">
        <div className="text-center space-y-4 pt-8">
          <h2 className="text-4xl font-bold tracking-tight">Joined Room</h2>
          <p className="text-lg text-muted-foreground">
            Room code: <span className="font-mono font-bold">{roomCode}</span>
          </p>
        </div>

        {joinAdminToken.trim() && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Your scorer token has been saved on this device. You can use Host / Scorer to manage the game.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Role</CardTitle>
              <CardDescription>
                Select how you want to use this device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleNavigateToHost}
                className="w-full h-16 text-lg"
                size="lg"
              >
                <Users className="h-6 w-6 mr-3" />
                Host / Scorer
              </Button>
              <Button
                onClick={handleNavigateToDisplay}
                variant="outline"
                className="w-full h-16 text-lg"
                size="lg"
              >
                <Tv className="h-6 w-6 mr-3" />
                Display / TV
              </Button>
            </CardContent>
          </Card>

          <Button
            onClick={handleBackToStart}
            variant="ghost"
            className="w-full"
          >
            Back to Start
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      <div className="text-center space-y-4 pt-8">
        <h2 className="text-4xl font-bold tracking-tight">Start New Game</h2>
        <p className="text-lg text-muted-foreground">
          Configure your game settings
        </p>
      </div>

      <div className="space-y-8">
        {/* Multi-device Section */}
        <Card>
          <CardHeader>
            <CardTitle>Multi-Device Mode</CardTitle>
            <CardDescription>
              Play across multiple devices with live sync
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleCreateRoom}
                disabled={isCreatingRoom}
                variant="outline"
                className="h-20 text-base"
                size="lg"
              >
                {isCreatingRoom ? (
                  'Creating...'
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Create Room
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter room code"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  className="h-12 text-base font-mono"
                  maxLength={6}
                />
                <Input
                  type="text"
                  placeholder="Scorer token (optional)"
                  value={joinAdminToken}
                  onChange={(e) => setJoinAdminToken(e.target.value)}
                  className="h-12 text-sm"
                />
                <Button
                  onClick={handleJoinRoom}
                  disabled={isJoiningRoom || !joinRoomCode.trim()}
                  variant="outline"
                  className="w-full h-12"
                >
                  {isJoiningRoom ? 'Joining...' : 'Join Room'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or play locally
            </span>
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <Label className="text-lg font-semibold">Game Mode</Label>
          <RadioGroup
            value={mode.toString()}
            onValueChange={(value) => setMode(Number(value) as 301 | 501)}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="301"
                id="mode-301"
                className="peer sr-only"
              />
              <Label
                htmlFor="mode-301"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <span className="text-3xl font-bold mb-2">301</span>
                <span className="text-sm text-muted-foreground">Quick Game</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="501"
                id="mode-501"
                className="peer sr-only"
              />
              <Label
                htmlFor="mode-501"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <span className="text-3xl font-bold mb-2">501</span>
                <span className="text-sm text-muted-foreground">Standard Game</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Double Out Toggle */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="double-out" className="text-lg font-semibold">
                Double Out
              </Label>
              <p className="text-sm text-muted-foreground">
                Require a double to finish the game
              </p>
            </div>
            <Switch
              id="double-out"
              checked={doubleOut}
              onCheckedChange={setDoubleOut}
            />
          </div>
        </div>

        {/* Players */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Players</Label>
            <Button
              onClick={handleAddPlayer}
              disabled={players.length >= 4}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Player
            </Button>
          </div>

          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={index} className="flex gap-3">
                <Input
                  type="text"
                  placeholder={`Player ${index + 1} name`}
                  value={player}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  className="h-12 text-base"
                />
                {players.length > 1 && (
                  <Button
                    onClick={() => handleRemovePlayer(index)}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <Button
          onClick={handleStartGame}
          size="lg"
          className="w-full h-14 text-lg gap-3"
        >
          <Play className="h-5 w-5" />
          Start Game
        </Button>
      </div>
    </div>
  );
}
