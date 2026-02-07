import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useUserGameHistory } from '../hooks/useGameHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trophy, ChevronLeft, ChevronRight, LogIn, Eye } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function GameHistoryPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const userId = identity?.getPrincipal().toString();

  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Convert date strings to nanosecond timestamps
  const fromTimestamp = fromDate ? BigInt(new Date(fromDate).getTime() * 1_000_000) : null;
  const toTimestamp = toDate ? BigInt(new Date(toDate).getTime() * 1_000_000) : null;

  const { data: games, isLoading } = useUserGameHistory(
    userId || '',
    {
      limit: ITEMS_PER_PAGE,
      offset: page * ITEMS_PER_PAGE,
      mode: mode === 'all' ? null : mode,
      from: fromTimestamp,
      to: toTimestamp,
    }
  );

  const handleFilterChange = () => {
    // Reset to first page when filters change
    setPage(0);
  };

  const handleModeChange = (value: string) => {
    setMode(value);
    setPage(0);
  };

  const handleFromDateChange = (value: string) => {
    setFromDate(value);
    setPage(0);
  };

  const handleToDateChange = (value: string) => {
    setToDate(value);
    setPage(0);
  };

  const handleGameClick = (gameId: bigint) => {
    navigate({ to: '/games/$id', params: { id: gameId.toString() } });
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game History
            </CardTitle>
            <CardDescription>Sign in to view your game history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You need to sign in to view your game history.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/login' })} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Game History
          </CardTitle>
          <CardDescription>View your past games and statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select value={mode} onValueChange={handleModeChange}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="301">301</SelectItem>
                  <SelectItem value="501">501</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="datetime-local"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="datetime-local"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
              />
            </div>
          </div>

          {/* Games Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : games && games.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Avg</TableHead>
                      <TableHead>180s</TableHead>
                      <TableHead>Checkout %</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map((game) => (
                      <TableRow key={game.gameId.toString()} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          {new Date(Number(game.startedAt) / 1_000_000).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{game.mode}</Badge>
                        </TableCell>
                        <TableCell>
                          {game.finishedAt
                            ? `${Math.round((Number(game.finishedAt) - Number(game.startedAt)) / 60_000_000_000)}m`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {game.win ? (
                            <Badge variant="default">Win</Badge>
                          ) : (
                            <Badge variant="secondary">Loss</Badge>
                          )}
                        </TableCell>
                        <TableCell>{game.avg.toFixed(1)}</TableCell>
                        <TableCell>{Number(game._180s)}</TableCell>
                        <TableCell>{game.checkoutPercent.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGameClick(game.gameId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!games || games.length < ITEMS_PER_PAGE}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No games found</p>
              <p className="text-sm">
                {mode !== 'all' || fromDate || toDate
                  ? 'Try adjusting your filters'
                  : 'Play some games to see your history!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
