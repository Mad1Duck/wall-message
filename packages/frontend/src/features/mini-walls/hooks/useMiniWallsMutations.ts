import { useMutation, useQueryClient } from '@tanstack/react-query'
import { miniWallsApi, miniWallKeys } from '../api/mini-walls.api'
import type { CreateMiniWallInput, UpdateMiniWallInput } from '../types'

export function useCreateMiniWall() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMiniWallInput) => miniWallsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: miniWallKeys.byWall(variables.wallId) })
    },
  })
}

export function useUpdateMiniWall() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMiniWallInput }) =>
      miniWallsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: miniWallKeys.byId(variables.id) })
    },
  })
}

export function useDeleteMiniWall() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => miniWallsApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: miniWallKeys.byId(id) })
    },
  })
}
