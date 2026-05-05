import { useMutation, useQueryClient } from '@tanstack/react-query'
import { wallsApi, wallKeys } from '../api/walls.api'
import type { CreateWallData } from '../types'
import { setCachedProfile } from '#/lib/cache'

export function useCreateWall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWallData) => wallsApi.create(data),
    onSuccess: (wall) => {
      queryClient.setQueryData(wallKeys.byUsername(wall.username), wall)
      queryClient.setQueryData(wallKeys.byClerk(wall.clerk_uid), wall)
      queryClient.invalidateQueries({ queryKey: wallKeys.all })
      setCachedProfile(wall)
    },
  })
}
