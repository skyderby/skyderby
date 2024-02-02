import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { queryKey, recordEndpoint, roundSchema, Round } from './common'

const deleteRound = (eventId: number, roundId: number) =>
  client
    .delete<never>(recordEndpoint(eventId, roundId))
    .then(response => roundSchema.parse(response.data))

const useDeleteRoundMutation = (eventId: number, roundId: number) => {
  const queryClient = useQueryClient()
  const mutationFn = () => deleteRound(eventId, roundId)

  return useMutation<Round, AxiosError<Record<string, string[]>>>({
    mutationFn,
    onSuccess() {
      return queryClient.invalidateQueries({ queryKey: queryKey(eventId), exact: true })
    }
  })
}

export default useDeleteRoundMutation
