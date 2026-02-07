import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { GameWithStatistics, Turn } from '../backend';

interface GameHistoryFilters {
  limit: number;
  offset: number;
  mode?: string | null;
  from?: bigint | null;
  to?: bigint | null;
}

export function useUserGameHistory(userId: string, filters: GameHistoryFilters) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GameWithStatistics[]>({
    queryKey: ['userGameHistory', userId, filters],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserGamesParticipated(
        userId,
        BigInt(filters.limit),
        BigInt(filters.offset),
        filters.mode || null,
        filters.from || null,
        filters.to || null
      );
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGameTurns(gameId: bigint, limit: number, offset: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Turn[]>({
    queryKey: ['gameTurns', gameId.toString(), limit, offset],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTurnsByGamePaginated(gameId, BigInt(limit), BigInt(offset));
    },
    enabled: !!actor && !actorFetching,
  });
}
