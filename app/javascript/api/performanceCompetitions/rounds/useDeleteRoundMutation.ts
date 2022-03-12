import { useMutation, useQueryClient } from 'react-query'
import client from 'api/client'
import { elementEndpoint, queryKey } from './common'

const deleteRound = (eventId: number, id: number) =>
  client.delete(elementEndpoint(eventId, id))

const useDeleteRoundMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  return useMutation(() => deleteRound(eventId, id), {
    onSuccess() {
      return queryClient.invalidateQueries(queryKey(eventId), { exact: true })
    }
  })
}

export default useDeleteRoundMutation
