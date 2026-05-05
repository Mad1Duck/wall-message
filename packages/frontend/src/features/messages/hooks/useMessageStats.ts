import { useQuery } from '@tanstack/react-query'
import { messagesApi, messageKeys } from '../api/messages.api'

export function useMessageStats() {
  return useQuery({
    queryKey: messageKeys.stats,
    queryFn: messagesApi.getStats,
    staleTime: 1000 * 60,
  })
}
