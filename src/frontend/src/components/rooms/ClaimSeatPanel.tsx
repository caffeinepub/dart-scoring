import { useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { GameSnapshot } from '../../lib/realtimeEventEnvelope';
import { getPlayerDisplayName, isPlayerUnclaimed } from '../../lib/playerDisplayName';
import { claimPlayerSeat } from '../../lib/roomGameApi';
import { useActor } from '../../hooks/useActor';

interface ClaimSeatPanelProps {
  snapshot: GameSnapshot;
  isAuthenticated: boolean;
  onClaimSuccess: () => void;
}

export default function ClaimSeatPanel({ 
  snapshot, 
  isAuthenticated,
  onClaimSuccess 
}: ClaimSeatPanelProps) {
  const { actor } = useActor();
  const [claimingPlayerId, setClaimingPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const unclaimedPlayers = snapshot.players.filter(isPlayerUnclaimed);

  const handleClaimSeat = async (playerId: string) => {
    if (!isAuthenticated) {
      setError('You must be signed in to claim a seat.');
      return;
    }

    setClaimingPlayerId(playerId);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await claimPlayerSeat(actor, snapshot.game.id, playerId);
      
      if (result.ok) {
        setSuccessMessage(result.message || 'Seat claimed successfully!');
        // Trigger refresh after a short delay
        setTimeout(() => {
          onClaimSuccess();
        }, 1000);
      } else {
        setError(result.message || 'Failed to claim seat');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setClaimingPlayerId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Claim Your Seat
          </CardTitle>
          <CardDescription>
            Sign in to claim a player seat in this game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be signed in to claim a seat. Use the sign-in button in the header.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (unclaimedPlayers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Claim Your Seat
        </CardTitle>
        <CardDescription>
          Select an unclaimed seat to link it to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {unclaimedPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{getPlayerDisplayName(player)}</span>
                  <Badge variant="secondary" className="text-xs">
                    Unclaimed
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Remaining: {player.remaining}
                </p>
              </div>
              <Button
                onClick={() => handleClaimSeat(player.id)}
                disabled={claimingPlayerId !== null}
                size="sm"
                className="gap-2"
              >
                {claimingPlayerId === player.id ? (
                  'Claiming...'
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Claim Seat
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
