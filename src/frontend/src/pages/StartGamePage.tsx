import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Play, UserPlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { saveGameSettings, sanitizePlayerNames } from '../lib/gameSettings';

export default function StartGamePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<301 | 501>(501);
  const [doubleOut, setDoubleOut] = useState(false);
  const [players, setPlayers] = useState(['', '']);

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
    navigate({ to: '/game' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      <div className="text-center space-y-4 pt-8">
        <h2 className="text-4xl font-bold tracking-tight">Start New Game</h2>
        <p className="text-lg text-muted-foreground">
          Configure your game settings
        </p>
      </div>

      <div className="space-y-8">
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
                <span className="text-3xl font-bold">301</span>
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
                <span className="text-3xl font-bold">501</span>
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
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* Players Section */}
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
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={`Player ${index + 1}`}
                    value={player}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                {players.length > 1 && (
                  <Button
                    onClick={() => handleRemovePlayer(index)}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {players.length} of 4 players • Minimum 1 player required
          </p>
        </div>
      </div>

      {/* Start Game Button */}
      <div className="pt-4">
        <Button
          onClick={handleStartGame}
          className="w-full h-16 text-lg font-semibold shadow-lg"
          size="lg"
        >
          <span className="flex items-center justify-center gap-3">
            <Play className="h-6 w-6" fill="currentColor" />
            Start Game
          </span>
        </Button>
      </div>
    </div>
  );
}
