import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Game } from '../backend';

/**
 * Hook to fetch game metadata for a specific game ID.
 */
export function useGameDetails(gameId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Game | null>({
    queryKey: ['game', gameId?.toString()],
    queryFn: async () => {
      if (!actor || !gameId) return null;
      return actor.getGame(gameId);
    },
    enabled: !!actor && !actorFetching && gameId !== null,
    retry: false,
  });
}
