import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GameSnapshot } from '../../lib/realtimeEventEnvelope';
import { getPlayerDisplayName } from '../../lib/playerDisplayName';

interface RecentTurnsReadOnlyProps {
  snapshot: GameSnapshot;
}

export default function RecentTurnsReadOnly({ snapshot }: RecentTurnsReadOnlyProps) {
  const recentTurns = snapshot.last_turns.slice(-10).reverse();

  if (recentTurns.length === 0) {
    return null;
  }

  return (
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
            {recentTurns.map((turn) => {
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
  );
}
