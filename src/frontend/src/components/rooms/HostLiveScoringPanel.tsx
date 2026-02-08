import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Undo2, Send } from 'lucide-react';
import { submitScore, undoLastTurn } from '../../lib/roomGameApi';
import { getPlayerDisplayName } from '../../lib/playerDisplayName';
import { useActor } from '../../hooks/useActor';
import type { GameSnapshot } from '../../lib/realtimeEventEnvelope';

interface HostLiveScoringPanelProps {
  snapshot: GameSnapshot;
  roomCode: string;
  adminToken: string | undefined;
  onSnapshotUpdate: (snapshot: GameSnapshot) => void;
  onError: (message: string) => void;
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
  const [isUndoing, setIsUndoing] = useState(false);

  const currentPlayer = snapshot.players.find(
    (p) => p.id === snapshot.game.current_player_id
  );

  const handleSubmitScore = async () => {
    const score = parseInt(scoreInput, 10);
    if (isNaN(score) || score < 0 || score > 180) {
      onError('Please enter a valid score (0-180)');
      return;
    }

    if (!currentPlayer) {
      onError('No current player found');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitScore(
        actor,
        snapshot.game.id,
        currentPlayer.id,
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
    setIsUndoing(true);
    try {
      const result = await undoLastTurn(actor, snapshot.game.id, roomCode, adminToken);

      if (result.ok && result.snapshot) {
        onSnapshotUpdate(result.snapshot);
      } else {
        onError(result.message || 'Failed to undo turn');
      }
    } catch (err) {
      onError('Failed to undo turn. Please try again.');
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Cards */}
      <div className="grid grid-cols-2 gap-4">
        {snapshot.players.map((player) => {
          const isActive = player.id === snapshot.game.current_player_id;
          return (
            <Card
              key={player.id}
              className={isActive ? 'border-primary border-2' : ''}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {getPlayerDisplayName(player)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{player.remaining}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Score Entry */}
      <Card>
        <CardHeader>
          <CardTitle>
            Current Player: {currentPlayer ? getPlayerDisplayName(currentPlayer) : 'None'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score-input">Enter Score</Label>
            <Input
              id="score-input"
              type="number"
              min="0"
              max="180"
              placeholder="0-180"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitScore();
                }
              }}
              className="text-2xl h-16 text-center"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmitScore}
              disabled={isSubmitting || !scoreInput}
              className="flex-1 h-12"
              size="lg"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>

            <Button
              onClick={handleUndo}
              disabled={isUndoing || snapshot.last_turns.length === 0}
              variant="outline"
              className="h-12"
              size="lg"
            >
              {isUndoing ? (
                'Undoing...'
              ) : (
                <>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Undo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Turns */}
      {snapshot.last_turns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Turns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {snapshot.last_turns.slice(-5).reverse().map((turn, idx) => {
                const player = snapshot.players.find((p) => p.id === turn.player_id);
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <span className="font-medium">
                      {player ? getPlayerDisplayName(player) : 'Unknown'}
                    </span>
                    <span className="text-lg">{turn.scored_total}</span>
                    <span className="text-muted-foreground">
                      → {turn.remaining_after}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
