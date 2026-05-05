import { useQuery } from '@tanstack/react-query'
import { wallsApi, wallKeys } from '../api/walls.api'

export function useWallByClerk(clerkUid: string | undefined) {
  return useQuery({
    queryKey: wallKeys.byClerk(clerkUid ?? ''),
    queryFn: () => wallsApi.getByClerkUid(clerkUid!),
    enabled: !!clerkUid,
  })
}
