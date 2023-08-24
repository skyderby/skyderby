import { useMutation, useQueryClient } from 'react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import type { Result, SerializedResult } from './common'
import { queryKey, elementEndpoint } from './common'

const deleteResult = (eventId: number, id: number) =>
  client.delete<never, AxiosResponse<SerializedResult>>(elementEndpoint(eventId, id))

const useDeleteResultMutation = (eventId: number, id: number | undefined) => {
  const queryClient = useQueryClient()

  const mutationFn = () => {
    if (!eventId || !id) throw new Error('Missing eventId or id')

    return deleteResult(eventId, id)
  }

  return useMutation<
    AxiosResponse<SerializedResult>,
    AxiosError<Record<string, string[]>>
  >(mutationFn, {
    async onSuccess() {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []

      queryClient.setQueryData(
        queryKey(eventId),
        data.filter(result => result.id !== id)
      )
      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useDeleteResultMutation
