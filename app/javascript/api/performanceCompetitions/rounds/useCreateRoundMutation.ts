import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from 'api/client'
import { queryKey, Round, collectionEndpoint, roundSchema } from './common'

const createRound = (eventId: number, discipline: Round['task']) =>
  client.post<{ round: { discipline: Round['task'] } }>(collectionEndpoint(eventId), {
    round: { discipline }
  })

const useCreateRoundMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (discipline: Round['task']) => createRound(eventId, discipline)

  return useMutation({
    mutationFn,
    onSuccess(response) {
      const data: Round[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const round = roundSchema.parse(response.data)
      queryClient.setQueryData(queryKey(eventId), [...data, round])
    }
  })
}

export default useCreateRoundMutation
