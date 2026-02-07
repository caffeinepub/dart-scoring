import { useState } from 'react';
import { Undo } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PlayerCard from '../game/PlayerCard';
import { submitScore, undoLastTurn } from '../../lib/roomGameApi';
import { useActor } from '../../hooks/useActor';
import type { GameSnapshot } from '../../lib/realtimeEventEnvelope';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface HostLiveScoringPanelProps {
  snapshot: GameSnapshot;
  roomCode: string;
  adminToken: string;
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

  const handleSubmitScore = async () => {
    const score = parseInt(scoreInput, 10);
    if (isNaN(score) || score < 0 || score > 180) {
      onError('Score must be between 0 and 180');
      return;
    }

    if (!adminToken) {
      onError('Scorer token required. Please refresh and enter your token.');
      return;
    }

    setIsSubmitting(true);
    onError('');
    
    try {
      const playerId = snapshot.currentPlayerIndex.toString();
      
      const result = await submitScore(
        actor,
        roomCode,
        adminToken,
        snapshot.gameId,
        playerId,
        score,
        snapshot
      );
      
      if (result.ok && result.snapshot) {
        onSnapshotUpdate(result.snapshot);
        setScoreInput('');
      } else {
        onError(result.message || 'Failed to submit score');
      }
    } catch (err) {
      onError('Failed to submit score');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (snapshot.turnHistory.length === 0) {
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
      onError('Failed to undo turn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmitScore();
    }
  };

  if (snapshot.phase === 'game-over' && snapshot.winner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-2xl font-bold">{snapshot.winner.playerName} wins!</p>
          <p className="text-muted-foreground">
            Finished in {snapshot.winner.turns} turns
          </p>
        </CardContent>
      </Card>
    );
  }

  const recentTurns = snapshot.turnHistory.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {snapshot.players.map((player, index) => (
          <PlayerCard
            key={index}
            name={player.name}
            score={player.remaining}
            isActive={index === snapshot.currentPlayerIndex}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Enter score (0-180)"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              onKeyPress={handleKeyPress}
              min="0"
              max="180"
              className="h-14 text-lg"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleSubmitScore}
              disabled={isSubmitting || !scoreInput}
              className="h-14 px-8 text-lg"
              size="lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
          
          <Button
            onClick={handleUndo}
            disabled={isSubmitting || snapshot.turnHistory.length === 0}
            variant="outline"
            className="w-full h-12"
          >
            <Undo className="h-4 w-4 mr-2" />
            Undo Last Turn
          </Button>
        </CardContent>
      </Card>

      {recentTurns.length > 0 && (
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
                {recentTurns.map((turn) => (
                  <TableRow key={turn.turnNumber}>
                    <TableCell className="font-medium">#{turn.turnNumber}</TableCell>
                    <TableCell>{turn.playerName}</TableCell>
                    <TableCell className="text-right font-mono">
                      {turn.isBust ? (
                        <span className="text-destructive">BUST</span>
                      ) : (
                        <span>-{turn.scoredPoints}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {turn.remainingAfter}
                    </TableCell>
                    <TableCell className="text-center">
                      {turn.isConfirmedWin && (
                        <span className="inline-block px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          WIN
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
