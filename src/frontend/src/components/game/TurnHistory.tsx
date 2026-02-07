import type { Turn } from '../../lib/gameCore';
import { AlertCircle, CheckCircle2, Trophy } from 'lucide-react';

interface TurnHistoryProps {
  turns: Turn[];
}

function formatDart(mult: string, value: number): string {
  if (mult === 'OB') return 'OB';
  if (mult === 'B') return 'Bull';
  return `${mult}${value}`;
}

function formatDartBreakdown(turn: Turn): string {
  if (turn.darts.length === 0) {
    return '';
  }
  
  const dartStrings = turn.darts.map(dart => formatDart(dart.mult, dart.value));
  return ` (${dartStrings.join(' ')})`;
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
                  <td className="p-4 text-sm font-medium">{turn.playerName}</td>
                  <td className="p-4 text-sm text-right font-mono">
                    {turn.isBust ? (
                      <span className="text-destructive font-semibold">
                        BUST{formatDartBreakdown(turn)}
                      </span>
                    ) : (
                      <span>
                        -{turn.scoredPoints}{formatDartBreakdown(turn)}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-right font-mono font-semibold">
                    {turn.remainingAfter}
                  </td>
                  <td className="p-4 text-center">
                    {turn.isBust ? (
                      <AlertCircle className="h-5 w-5 text-destructive inline-block" />
                    ) : turn.isConfirmedWin ? (
                      <Trophy className="h-5 w-5 text-primary inline-block" />
                    ) : turn.remainingAfter === 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-success inline-block" />
                    ) : null}
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
