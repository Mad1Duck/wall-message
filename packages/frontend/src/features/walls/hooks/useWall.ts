import { useQuery } from '@tanstack/react-query'
import { wallsApi, wallKeys } from '../api/walls.api'

export function useWall(username: string) {
  return useQuery({
    queryKey: wallKeys.byUsername(username),
    queryFn: () => wallsApi.getByUsername(username),
    enabled: !!username,
  })
}
