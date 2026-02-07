import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { loadSavedGame } from '../lib/gamePersistence';
import { computeGameStats } from '../lib/gameStats';

export default function StatsPage() {
  const navigate = useNavigate();
  const savedGame = loadSavedGame();

  const handleBack = () => {
    if (savedGame && savedGame.phase === 'in-progress') {
      navigate({ to: '/game', search: {} });
    } else {
      navigate({ to: '/' });
    }
  };

  if (!savedGame) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Game Data</CardTitle>
            <CardDescription>
              There is no active or saved game to display statistics for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/' })}>
              Start New Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = computeGameStats(savedGame);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Game</span>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Statistics</CardTitle>
          <CardDescription>
            {savedGame.settings.mode} • {savedGame.settings.doubleOut ? 'Double Out' : 'Straight Out'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                  <TableHead className="text-right">First 9</TableHead>
                  <TableHead className="text-right">180s</TableHead>
                  {savedGame.settings.doubleOut && (
                    <TableHead className="text-right">Checkout %</TableHead>
                  )}
                  <TableHead className="text-right">Busts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((playerStat) => (
                  <TableRow key={playerStat.playerIndex}>
                    <TableCell className="font-medium">
                      {playerStat.playerName}
                    </TableCell>
                    <TableCell className="text-right">
                      {playerStat.avg.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {playerStat.first9Avg !== null
                        ? playerStat.first9Avg.toFixed(1)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {playerStat.count180s}
                    </TableCell>
                    {savedGame.settings.doubleOut && (
                      <TableCell className="text-right">
                        {playerStat.checkoutPercent !== null
                          ? `${playerStat.checkoutPercent.toFixed(0)}%`
                          : '—'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {playerStat.busts}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
