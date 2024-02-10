import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import client from 'api/client'
import { Competitor, elementEndpoint, queryKey, competitorSchema } from './common'

const deleteCompetitor = (eventId: number, id: number) =>
  client
    .delete<never>(elementEndpoint(eventId, id))
    .then(response => competitorSchema.parse(response.data))

const useDeleteCompetitorMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteCompetitor(eventId, id)

  return useMutation<Competitor, AxiosError<Record<string, string[]>>, undefined>({
    mutationFn,
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
