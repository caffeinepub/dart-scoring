import { useState } from 'react';
import { Undo } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitScore, undoLastTurn } from '../../lib/roomGameApi';
import { useActor } from '../../hooks/useActor';
import type { GameSnapshot } from '../../lib/realtimeEventEnvelope';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPlayerDisplayName } from '../../lib/playerDisplayName';

interface HostLiveScoringPanelProps {
  snapshot: GameSnapshot;
  roomCode: string;
  adminToken: string | null;
  onSnapshotUpdate: (snapshot: GameSnapshot) => void;
  onError: (error: string) => void;
}

export default function HostLiveScoringPanel({
  snapshot,
  roomCode,
  adminToken,
  onSnapshotUpdate,
  onError,
}: HostLiveScoringPanelProps) {
  const { actor } = useActor();
  const [scoreInput, setScoreInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPlayerId = snapshot.game.current_player_id;
  const currentPlayer = snapshot.players.find(p => p.id === currentPlayerId);
  const isGameOver = snapshot.game.status === 'completed';

  const handleSubmitScore = async () => {
    const score = parseInt(scoreInput, 10);
    if (isNaN(score) || score < 0 || score > 180) {
      onError('Please enter a valid score (0-180)');
      return;
    }

    setIsSubmitting(true);
    onError('');

    try {
      const result = await submitScore(
        actor,
        snapshot.game.id,
        currentPlayerId,
        score,
        roomCode,
        adminToken
      );

      if (result.ok && result.snapshot) {
        onSnapshotUpdate(result.snapshot);
        setScoreInput('');
      } else {
        onError(result.message || 'Failed to submit score');
      }
    } catch (err) {
      onError('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (snapshot.last_turns.length === 0) {
      onError('No turns to undo');
      return;
    }

    setIsSubmitting(true);
    onError('');

    try {
      const result = await undoLastTurn(snapshot);
      if (result.ok && result.snapshot) {
        onSnapshotUpdate(result.snapshot);
      } else {
        onError(result.message || 'Failed to undo turn');
      }
    } catch (err) {
      onError('Failed to undo turn. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSubmitting && scoreInput.trim()) {
      handleSubmitScore();
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {snapshot.players.map((player) => (
          <Card
            key={player.id}
            className={`${
              player.id === currentPlayerId && !isGameOver
                ? 'border-2 border-primary bg-primary/5'
                : 'border-2 border-border'
            }`}
          >
            <CardContent className="pt-4 pb-4 text-center space-y-2">
              <h3 className="text-lg font-semibold">{getPlayerDisplayName(player)}</h3>
              {player.id === currentPlayerId && !isGameOver && (
                <span className="inline-block px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Active
                </span>
              )}
              <p className="text-3xl font-bold">{player.remaining}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Entry */}
      {!isGameOver && currentPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Score for {getPlayerDisplayName(currentPlayer)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter score (0-180)"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
                className="h-12 text-lg"
                min="0"
                max="180"
              />
              <Button
                onClick={handleSubmitScore}
                disabled={isSubmitting || !scoreInput.trim()}
                className="h-12 px-8"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
            <Button
              onClick={handleUndo}
              disabled={isSubmitting || snapshot.last_turns.length === 0}
              variant="outline"
              className="w-full gap-2"
            >
              <Undo className="h-4 w-4" />
              Undo Last Turn
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Turns Table */}
      {snapshot.last_turns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Turns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Turn</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.last_turns.slice(-10).reverse().map((turn) => {
                  const player = snapshot.players.find(p => p.id === turn.player_id);
                  const playerName = player ? getPlayerDisplayName(player) : 'Unknown';
                  
                  return (
                    <TableRow key={turn.id}>
                      <TableCell className="font-medium">#{turn.turn_index + 1}</TableCell>
                      <TableCell>{playerName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {turn.is_bust ? (
                          <span className="text-destructive">BUST</span>
                        ) : (
                          <span>-{turn.scored_total}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {turn.remaining_after}
                      </TableCell>
                      <TableCell className="text-center">
                        {turn.is_win && (
                          <span className="inline-block px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            WIN
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
