import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from 'api/client'
import { trackQuery } from 'api/tracks'
import { pointsQuery } from 'api/tracks/points'
import type { Result } from './common'
import { queryKey, elementEndpoint, resultSchema } from './common'

type UpdateVariables = {
  trackAttributes?: {
    ffStart: number
    ffEnd: number
  }
}

const updateResult = (eventId: number, id: number, result: UpdateVariables) =>
  client
    .put<{ result: UpdateVariables }>(elementEndpoint(eventId, id), { result })
    .then(response => resultSchema.parse(response.data))

const useUpdateResultMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (result: UpdateVariables) => updateResult(eventId, id, result)

  return useMutation<Result, AxiosError, UpdateVariables>({
    mutationFn,
    async onSuccess(updatedResult) {
      const data = queryClient.getQueryData<Result[]>(queryKey(eventId)) ?? []

      queryClient.setQueryData(
        queryKey(eventId),
        data.map(result => (result.id === id ? updatedResult : result))
      )
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trackQuery(updatedResult.trackId).queryKey
        }),
        queryClient.invalidateQueries({
          queryKey: pointsQuery(updatedResult.trackId, { originalFrequency: true })
            .queryKey,
          refetchType: 'all'
        })
      ])
    }
  })
}

export default useUpdateResultMutation
