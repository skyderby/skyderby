import { useMutation, UseMutationResult, useQueryClient } from 'react-query'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import client, { AxiosResponse, AxiosError } from 'api/client'
import { Competitor, elementEndpoint, queryKey, SerializedCompetitor } from './common'

const deleteCompetitor = (eventId: number, id: number) =>
  client.delete<never, AxiosResponse<SerializedCompetitor>>(elementEndpoint(eventId, id))

const useDeleteCompetitorMutation = (
  eventId: number,
  id: number
): UseMutationResult<AxiosResponse<SerializedCompetitor>, AxiosError> => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteCompetitor(eventId, id)

  return useMutation(mutationFn, {
    async onSuccess() {
      const data: Competitor[] = queryClient.getQueryData(queryKey(eventId)) ?? []

      queryClient.setQueryData(
        queryKey(eventId),
        data.filter(competitor => competitor.id !== id)
      )

      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useDeleteCompetitorMutation
