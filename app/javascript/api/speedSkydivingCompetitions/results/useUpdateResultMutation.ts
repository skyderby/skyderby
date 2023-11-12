import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'
import { trackQuery } from 'api/tracks'
import { pointsQuery } from 'api/tracks/points'
import type { Result, SerializedResult } from './common'
import { deserialize, queryKey, elementEndpoint } from './common'

type UpdateVariables = {
  trackAttributes?: {
    ffStart: number
    ffEnd: number
  }
}

const updateResult = (eventId: number, id: number, result: UpdateVariables) =>
  client.put<{ result: UpdateVariables }, AxiosResponse<SerializedResult>>(
    elementEndpoint(eventId, id),
    { result }
  )

const useUpdateResultMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (result: UpdateVariables) => updateResult(eventId, id, result)

  return useMutation<AxiosResponse<SerializedResult>, AxiosError, UpdateVariables>({
    mutationFn,
    async onSuccess(response) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedResult = deserialize(response.data)
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(result => (result.id === id ? updatedResult : result))
      )
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trackQuery(response.data.trackId).queryKey
        }),
        queryClient.invalidateQueries({
          queryKey: pointsQuery(response.data.trackId, { originalFrequency: true })
            .queryKey,
          refetchType: 'all'
        })
      ])
    }
  })
}

export default useUpdateResultMutation
