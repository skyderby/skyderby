import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from 'api/client'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import type { Result } from './common'
import { queryKey, elementEndpoint, resultSchema } from './common'

const deleteResult = (eventId: number, id: number) =>
  client
    .delete<never>(elementEndpoint(eventId, id))
    .then(response => resultSchema.parse(response.data))

const useDeleteResultMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteResult(eventId, id)

  return useMutation<Result, AxiosError<Record<string, string[]>>>({
    mutationFn,
    async onSuccess(deletedResult) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []

      queryClient.setQueryData(
        queryKey(eventId),
        data.filter(result => result.id !== deletedResult.id)
      )
      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useDeleteResultMutation
