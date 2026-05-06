import { useQuery } from '@tanstack/react-query';
import { messagesApi, messageKeys } from '../api/messages.api';

export function useMessages(wallId: string | undefined) {
  return useQuery({
    queryKey: messageKeys.byWall(wallId ?? ''),
    queryFn: () => messagesApi.getByWallId(wallId!),
    enabled: !!wallId,
    refetchInterval: 30_000,
    select: (data) =>
      [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
  });
}

export function useMessagesByMiniWall(miniWallId: string | undefined) {
  return useQuery({
    queryKey: messageKeys.byMiniWall(miniWallId ?? ''),
    queryFn: () => messagesApi.getByMiniWallId(miniWallId!),
    enabled: !!miniWallId,
    refetchInterval: 30_000,
    select: (data) =>
      [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
  });
}
