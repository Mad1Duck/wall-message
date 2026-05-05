import { useQuery } from '@tanstack/react-query';
import { miniWallsApi, miniWallKeys } from '../api/mini-walls.api';

export function useMiniWalls(wallId: string | undefined) {
  return useQuery({
    queryKey: miniWallKeys.byWall(wallId ?? ''),
    queryFn: () => miniWallsApi.getByWallId(wallId!),
    enabled: !!wallId,
    staleTime: 1000 * 60,
  });
}

export function useMiniWall(id: string | undefined) {
  return useQuery({
    queryKey: miniWallKeys.byId(id ?? ''),
    queryFn: () => miniWallsApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useMiniWallBySlug(wallId: string | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: miniWallKeys.bySlug(wallId ?? '', slug ?? ''),
    queryFn: () => miniWallsApi.getBySlug(wallId!, slug!),
    enabled: !!wallId && !!slug,
    staleTime: 1000 * 60,
  });
}
