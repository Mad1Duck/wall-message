import { useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesApi, messageKeys } from '../api/messages.api'
import type { ReactionType, Message } from '../types'

export function useReactToMessage(wallId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: ReactionType }) =>
      messagesApi.react(id, type),

    onMutate: async ({ id, type }) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.byWall(wallId) })
      const previous = queryClient.getQueryData<Message[]>(messageKeys.byWall(wallId))

      queryClient.setQueryData<Message[]>(messageKeys.byWall(wallId), (old) =>
        old?.map((m) =>
          m.id === id
            ? { ...m, [`react_${type}`]: m[`react_${type}` as keyof Message] as number + 1 }
            : m,
        ),
      )

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(messageKeys.byWall(wallId), context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.byWall(wallId) })
    },
  })
}
