import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import sortBy from 'lodash/sortBy'
import client from 'api/client'
import { queryKey as tournamentQueryKey, Tournament } from 'api/tournaments'
import {
  collectionEndpoint,
  competitorSchema,
  Competitor,
  CompetitorVariables
} from './common'

type Variables = {
  id: number | undefined
  competitor: CompetitorVariables
}

const createCompetitor = (tournamentId: number, competitor: CompetitorVariables) =>
  client
    .post<{ competitor: CompetitorVariables }>(collectionEndpoint(tournamentId), {
      competitor
    })
    .then(response => competitorSchema.parse(response.data))

const useCreateCompetitorMutation = (tournamentId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = ({ competitor }: Variables) =>
    createCompetitor(tournamentId, competitor)

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

export default useCreateCompetitorMutation
