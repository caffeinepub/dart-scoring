import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PlayerGameStats } from '../backend';

/**
 * Hook to fetch player game statistics for a specific game
 */
export function usePlayerGameStatsByGame(gameId: bigint | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PlayerGameStats[]>({
    queryKey: ['playerGameStats', 'game', gameId?.toString()],
    queryFn: async () => {
      if (!actor || gameId === null || gameId === undefined) return [];
      return actor.getPlayerGameStatsByGame(gameId);
    },
    enabled: !!actor && !actorFetching && gameId !== null && gameId !== undefined,
    retry: false,
  });
}

/**
 * Hook to fetch all player game statistics for a specific user
 */
export function usePlayerGameStatsByUser(userId: string | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PlayerGameStats[]>({
    queryKey: ['playerGameStats', 'user', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getPlayerGameStatsByUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    retry: false,
  });
}
