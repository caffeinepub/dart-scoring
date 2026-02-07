import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GameSnapshot } from '../../lib/realtimeEventEnvelope';

interface RecentTurnsReadOnlyProps {
  snapshot: GameSnapshot;
}

export default function RecentTurnsReadOnly({ snapshot }: RecentTurnsReadOnlyProps) {
  const recentTurns = snapshot.turnHistory.slice(-10).reverse();

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
  );
}
