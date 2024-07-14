import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import sortBy from 'lodash/sortBy'
import client from 'api/client'
import { queryKey as tournamentQueryKey, Tournament } from 'api/tournaments'
import {
  elementEndpoint,
  competitorSchema,
  Competitor,
  CompetitorVariables
} from './common'

type Variables = {
  id: number | undefined
  competitor: CompetitorVariables
}

const updateCompetitor = (
  tournamentId: number,
  competitorId: number,
  competitor: CompetitorVariables
) =>
  client
    .patch<{ competitor: CompetitorVariables }>(
      elementEndpoint(tournamentId, competitorId),
      {
        competitor
      }
    )
    .then(response => competitorSchema.parse(response.data))

const useUpdateCompetitorMutation = (tournamentId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = ({ id, competitor }: Variables) => {
    if (!id) throw new Error('Competitor ID is required')

    return updateCompetitor(tournamentId, id, competitor)
  }

  return useMutation<Competitor, AxiosError<Record<string, string[]>>, Variables>({
    mutationFn,
    onSuccess: competitor => {
      const data = queryClient.getQueryData<Tournament>(tournamentQueryKey(tournamentId))
      if (!data) return

      queryClient.setQueryData(tournamentQueryKey(tournamentId), {
        ...data,
        competitors: sortBy([...data.competitors, competitor], 'profile.name')
      })
    }
  })
}

export default useUpdateCompetitorMutation
