import { useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesApi, messageKeys } from '../api/messages.api'

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; wallId: string }) => messagesApi.deleteById(id),
    onSuccess: (_, { wallId }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.byWall(wallId) })
    },
  })
}
