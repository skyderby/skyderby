import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import client from 'api/client'
import { queryKey as tournamentQueryKey, Tournament } from 'api/tournaments'
import { elementEndpoint, competitorSchema, Competitor } from './common'

const deleteCompetitor = (tournamentId: number, competitorId: number) =>
  client
    .delete(elementEndpoint(tournamentId, competitorId))
    .then(response => competitorSchema.parse(response.data))

const useDeleteCompetitorMutation = (tournamentId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (competitorId: number) =>
    deleteCompetitor(tournamentId, competitorId)

  return useMutation<Competitor, AxiosError<Record<string, string[]>>, number>({
    mutationFn,
    onSuccess: deletedCompetitor => {
      const data = queryClient.getQueryData<Tournament>(tournamentQueryKey(tournamentId))
      if (!data) return

      queryClient.setQueryData(tournamentQueryKey(tournamentId), {
        ...data,
        competitors: data.competitors.filter(
          competitor => competitor.id !== deletedCompetitor.id
        )
      })
    }
  })
}

export default useDeleteCompetitorMutation
