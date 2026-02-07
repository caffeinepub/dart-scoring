import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserStats } from '../backend';

/**
 * Hook to fetch the current user's statistics
 */
export function useMyStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserStats | null>({
    queryKey: ['myStats'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyStats();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

/**
 * Hook to fetch statistics for a specific user
 */
export function useUserStats(userId: string | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserStats | null>({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserStats(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    retry: false,
  });
}
