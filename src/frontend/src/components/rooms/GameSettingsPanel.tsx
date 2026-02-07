import { useState } from 'react';
import { Play, UserPlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sanitizePlayerNames } from '../../lib/gameSettings';

export interface PlayerAssignment {
  name: string;
  assignTo: 'guest' | 'me';
}

interface GameSettingsPanelProps {
  onCreateGame: (settings: {
    mode: 301 | 501;
    doubleOut: boolean;
    players: PlayerAssignment[];
  }) => void;
  isCreating: boolean;
  canAssignMe?: boolean;
  currentUsername?: string;
}

export default function GameSettingsPanel({ 
  onCreateGame, 
  isCreating,
  canAssignMe = false,
  currentUsername
}: GameSettingsPanelProps) {
  const [mode, setMode] = useState<301 | 501>(501);
  const [doubleOut, setDoubleOut] = useState(false);
  const [players, setPlayers] = useState<PlayerAssignment[]>([
    { name: '', assignTo: 'guest' },
    { name: '', assignTo: 'guest' }
  ]);

  const handleAddPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, { name: '', assignTo: 'guest' }]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const handlePlayerNameChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], name: value };
    setPlayers(newPlayers);
  };

  const handlePlayerAssignmentChange = (index: number, value: 'guest' | 'me') => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], assignTo: value };
    setPlayers(newPlayers);
  };

  const handleSubmit = () => {
    const sanitizedPlayers = players.map(p => ({
      name: p.name.trim() || `Player ${players.indexOf(p) + 1}`,
      assignTo: p.assignTo
    }));
    onCreateGame({
      mode,
      doubleOut,
      players: sanitizedPlayers,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={mode.toString()}
            onValueChange={(value) => setMode(Number(value) as 301 | 501)}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="301"
                id="room-mode-301"
                className="peer sr-only"
              />
              <Label
                htmlFor="room-mode-301"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <span className="text-3xl font-bold">301</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="501"
                id="room-mode-501"
                className="peer sr-only"
              />
              <Label
                htmlFor="room-mode-501"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <span className="text-3xl font-bold">501</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Double Out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="room-double-out" className="text-base font-medium">
                Require a double to finish
              </Label>
              <p className="text-sm text-muted-foreground">
                Players must finish with a double
              </p>
            </div>
            <Switch
              id="room-double-out"
              checked={doubleOut}
              onCheckedChange={setDoubleOut}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Players</CardTitle>
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`player-name-${index}`} className="text-sm mb-2 block">
                      Player {index + 1} Name
                    </Label>
                    <Input
                      id={`player-name-${index}`}
                      type="text"
                      placeholder={`Player ${index + 1}`}
                      value={player.name}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  {players.length > 1 && (
                    <Button
                      onClick={() => handleRemovePlayer(index)}
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label htmlFor={`player-assign-${index}`} className="text-sm mb-2 block">
                    Assign Seat
                  </Label>
                  <Select
                    value={player.assignTo}
                    onValueChange={(value: 'guest' | 'me') => handlePlayerAssignmentChange(index, value)}
                  >
                    <SelectTrigger id={`player-assign-${index}`} className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest</SelectItem>
                      {canAssignMe && (
                        <SelectItem value="me">
                          Me {currentUsername ? `(${currentUsername})` : ''}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {!canAssignMe && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Sign in to assign seats to your account
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {players.length} of 4 players • Minimum 1 player required
          </p>
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={isCreating}
        className="w-full h-16 text-lg font-semibold shadow-lg"
        size="lg"
      >
        <span className="flex items-center justify-center gap-3">
          <Play className="h-6 w-6" fill="currentColor" />
          {isCreating ? 'Creating Game...' : 'Create Game'}
        </span>
      </Button>
    </div>
  );
}
