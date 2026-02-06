import type { Turn } from '../../lib/gameCore';
import { AlertCircle, CheckCircle2, Trophy } from 'lucide-react';

interface TurnHistoryProps {
  turns: Turn[];
}

export default function TurnHistory({ turns }: TurnHistoryProps) {
  // Display only the last 5 turns
  const displayTurns = turns.slice(-5);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="max-h-80 overflow-y-auto">
        {turns.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No turns recorded yet</p>
            <p className="text-sm mt-1">Start scoring to see turn history</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">Turn</th>
                <th className="text-left p-4 font-semibold text-sm">Player</th>
                <th className="text-right p-4 font-semibold text-sm">Score</th>
                <th className="text-right p-4 font-semibold text-sm">Remaining</th>
                <th className="text-center p-4 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayTurns.map((turn) => (
                <tr
                  key={turn.turnNumber}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 text-sm text-muted-foreground">#{turn.turnNumber}</td>
                  <td className="p-4 font-medium">{turn.playerName}</td>
                  <td className="p-4 text-right font-semibold">{turn.scoredPoints}</td>
                  <td className="p-4 text-right text-muted-foreground">{turn.remainingAfter}</td>
                  <td className="p-4 text-center">
                    {turn.isBust && (
                      <span className="inline-flex items-center gap-1 text-destructive text-xs font-medium">
                        <AlertCircle className="h-3 w-3" />
                        BUST
                      </span>
                    )}
                    {turn.isConfirmedWin && (
                      <span className="inline-flex items-center gap-1 text-primary text-xs font-medium">
                        <Trophy className="h-3 w-3" />
                        WIN
                      </span>
                    )}
                    {turn.needsDoubleConfirmation && !turn.isConfirmedWin && (
                      <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        FINISH
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
