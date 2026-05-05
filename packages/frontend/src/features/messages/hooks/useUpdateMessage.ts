import { useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesApi, messageKeys } from '../api/messages.api'
import type { UpdateMessageData } from '../types'

export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageData }) =>
      messagesApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.byWall(updated.wall_id) })
    },
  })
}
