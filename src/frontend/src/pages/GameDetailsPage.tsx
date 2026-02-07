import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGameDetails } from '../hooks/useGameDetails';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Target } from 'lucide-react';
import type { Turn } from '../backend';

const TURNS_PER_PAGE = 20;

export default function GameDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/games/$id' });
  const { actor } = useActor();
  const [page, setPage] = useState(0);

  // Parse game ID
  let gameId: bigint | null = null;
  try {
    gameId = BigInt(id);
  } catch (error) {
    // Invalid ID
  }

  // Fetch game metadata
  const { data: game, isLoading: gameLoading, error: gameError } = useGameDetails(gameId);

  // Fetch turns for this game
  const { data: turns, isLoading: turnsLoading } = useQuery<Turn[]>({
    queryKey: ['gameTurns', gameId?.toString(), page],
    queryFn: async () => {
      if (!actor || !gameId) return [];
      return actor.getTurnsByGamePaginated(gameId, BigInt(TURNS_PER_PAGE), BigInt(page * TURNS_PER_PAGE));
    },
    enabled: !!actor && gameId !== null,
  });

  if (gameId === null) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Game ID</CardTitle>
            <CardDescription>The game ID provided is not valid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                The game ID "{id}" is not a valid identifier.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/history' })} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameLoading || turnsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Game Not Found</CardTitle>
            <CardDescription>Unable to load game details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                The game with ID {id} could not be found or loaded.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/history' })} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Button onClick={() => navigate({ to: '/history' })} variant="ghost" size="sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to History
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Game Details
          </CardTitle>
          <CardDescription>Game ID: {id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={game.status === 'Completed' ? 'default' : 'secondary'}>
                {game.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Started</p>
              <p className="text-sm font-medium">
                {new Date(Number(game.startTime) / 1_000_000).toLocaleString()}
              </p>
            </div>
            {game.endTime && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Finished</p>
                <p className="text-sm font-medium">
                  {new Date(Number(game.endTime) / 1_000_000).toLocaleString()}
                </p>
              </div>
            )}
            {game.winnerPlayerId && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Winner</p>
                <p className="text-sm font-medium">Player {game.winnerPlayerId.toString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Turns</CardTitle>
          <CardDescription>Turn-by-turn breakdown of the game</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {turns && turns.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Turn</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Remaining Before</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {turns.map((turn) => (
                      <TableRow key={turn.id.toString()}>
                        <TableCell>{Number(turn.turnIndex) + 1}</TableCell>
                        <TableCell>Player {turn.playerId.toString()}</TableCell>
                        <TableCell>{Number(turn.score)}</TableCell>
                        <TableCell>{Number(turn.turnTotal)}</TableCell>
                        <TableCell>{Number(turn.remainingBefore)}</TableCell>
                        <TableCell>
                          {turn.isBust ? (
                            <Badge variant="destructive">BUST</Badge>
                          ) : (
                            <Badge variant="outline">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!turns || turns.length < TURNS_PER_PAGE}
                >
                  Next
                  <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No turns recorded</p>
              <p className="text-sm">This game has no turn data yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          Charts and heatmaps will be added in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}
