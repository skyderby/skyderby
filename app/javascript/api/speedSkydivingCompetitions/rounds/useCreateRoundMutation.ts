import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { Round, collectionEndpoint, roundSchema, queryKey } from './common'

const createRound = (eventId: number) =>
  client
    .post<never>(collectionEndpoint(eventId))
    .then(response => roundSchema.parse(response.data))

const useCreateRoundMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => createRound(eventId)

  return useMutation<Round, AxiosError<Record<string, string[]>>>({
    mutationFn,
    onSuccess(round) {
      const data: Round[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      queryClient.setQueryData(queryKey(eventId), [...data, round])
    }
  })
}

export default useCreateRoundMutation
