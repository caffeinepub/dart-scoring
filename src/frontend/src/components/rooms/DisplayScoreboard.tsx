import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { GameSnapshot } from '../../lib/realtimeEventEnvelope';
import { getPlayerDisplayName } from '../../lib/playerDisplayName';

interface DisplayScoreboardProps {
  snapshot: GameSnapshot;
}

export default function DisplayScoreboard({ snapshot }: DisplayScoreboardProps) {
  const isGameOver = snapshot.game.status === 'completed';
  const winnerPlayer = isGameOver && snapshot.game.winner_player_id
    ? snapshot.players.find(p => p.id === snapshot.game.winner_player_id)
    : null;

  if (isGameOver && winnerPlayer) {
    const winnerTurns = snapshot.last_turns.filter(t => t.player_id === winnerPlayer.id).length;
    
    return (
      <Card className="border-2 border-primary">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold">Game Over!</h2>
            <p className="text-3xl font-bold text-primary">{getPlayerDisplayName(winnerPlayer)} wins!</p>
            <p className="text-xl text-muted-foreground">
              Finished in {winnerTurns} turns
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlayerId = snapshot.game.current_player_id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {snapshot.players.map((player) => (
        <Card
          key={player.id}
          className={`${
            player.id === currentPlayerId
              ? 'border-2 border-primary bg-primary/5 shadow-lg'
              : 'border-2 border-border'
          }`}
        >
          <CardContent className="pt-6 pb-6 text-center space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{getPlayerDisplayName(player)}</h3>
              {player.id === currentPlayerId && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Active
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-5xl font-bold tracking-tight">{player.remaining}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
