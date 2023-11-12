import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from 'api/client'
import { elementEndpoint, queryKey } from './common'

const deleteRound = (eventId: number, id: number) =>
  client.delete(elementEndpoint(eventId, id))

const useDeleteRoundMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteRound(eventId, id)

  return useMutation({
    mutationFn,
    onSuccess() {
      return queryClient.invalidateQueries({ queryKey: queryKey(eventId), exact: true })
    }
  })
}

export default useDeleteRoundMutation
