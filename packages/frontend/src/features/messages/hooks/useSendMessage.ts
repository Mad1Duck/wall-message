import { useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesApi, messageKeys } from '../api/messages.api'
import type { SendMessageData } from '../types'

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageData) => messagesApi.send(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.byWall(variables.wall_id) })
    },
  })
}
