export default function TurnHistory() {
  // Mock turn data for UI demonstration
  const turns = [
    { id: 1, player: 'Player 1', score: 60, remaining: 441 },
    { id: 2, player: 'Player 2', score: 45, remaining: 456 },
    { id: 3, player: 'Player 1', score: 81, remaining: 360 },
  ];

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
              </tr>
            </thead>
            <tbody>
              {turns.map((turn, index) => (
                <tr
                  key={turn.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 text-sm text-muted-foreground">#{index + 1}</td>
                  <td className="p-4 font-medium">{turn.player}</td>
                  <td className="p-4 text-right font-semibold">{turn.score}</td>
                  <td className="p-4 text-right text-muted-foreground">{turn.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
