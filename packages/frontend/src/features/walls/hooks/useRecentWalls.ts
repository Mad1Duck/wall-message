import { useQuery } from '@tanstack/react-query'
import { wallsApi, wallKeys } from '../api/walls.api'

export function useRecentWalls(limit = 6) {
  return useQuery({
    queryKey: wallKeys.recent(limit),
    queryFn: () => wallsApi.getRecent(limit),
  })
}
