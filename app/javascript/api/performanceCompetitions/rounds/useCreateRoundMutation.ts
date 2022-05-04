import { useMutation, UseMutationResult, useQueryClient } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'
import {
  queryKey,
  Round,
  collectionEndpoint,
  SerializedRound,
  deserialize
} from './common'

const createRound = (eventId: number, discipline: Round['task']) =>
  client.post<{ round: { discipline: Round['task'] } }, AxiosResponse<SerializedRound>>(
    collectionEndpoint(eventId),
    { round: { discipline } }
  )

const useCreateRoundMutation = (
  eventId: number
): UseMutationResult<AxiosResponse<SerializedRound>, AxiosError, Round['task']> => {
  const queryClient = useQueryClient()

  const mutationFn = (discipline: Round['task']) => createRound(eventId, discipline)

  return useMutation(mutationFn, {
    onSuccess(response) {
      const data: Round[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const round = deserialize(response.data)
      queryClient.setQueryData(queryKey(eventId), [...data, round])
    }
  })
}

export default useCreateRoundMutation
