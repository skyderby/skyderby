import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import client from 'api/client'
import {
  collectionEndpoint,
  queryKey,
  CompetitorVariables,
  Competitor,
  competitorSchema
} from './common'

const createCompetitor = (eventId: number, competitor: CompetitorVariables) =>
  client
    .post<{ competitor: CompetitorVariables }>(collectionEndpoint(eventId), {
      competitor
    })
    .then(response => competitorSchema.parse(response.data))

const useNewCompetitorMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (competitor: CompetitorVariables) =>
    createCompetitor(eventId, competitor)

  return useMutation<
    Competitor,
    AxiosError<Record<string, string[]>>,
    CompetitorVariables
  >({
    mutationFn,
    async onSuccess(competitor) {
      const data = queryClient.getQueryData<Competitor[]>(queryKey(eventId)) ?? []

      queryClient.setQueryData(queryKey(eventId), [...data, competitor])

      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useNewCompetitorMutation
