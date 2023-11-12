import { useMutation, useQueryClient } from '@tanstack/react-query'

import client, { AxiosResponse } from 'api/client'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import {
  CompetitorVariables,
  Competitor,
  elementEndpoint,
  queryKey,
  deserialize,
  SerializedCompetitor
} from './common'
import { AxiosError } from 'axios'

const updateCompetitor = (eventId: number, id: number, competitor: CompetitorVariables) =>
  client.put<{ competitor: CompetitorVariables }, AxiosResponse>(
    elementEndpoint(eventId, id),
    { competitor }
  )

const useUpdateCompetitorMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (competitor: CompetitorVariables) =>
    updateCompetitor(eventId, id, competitor)

  return useMutation<
    AxiosResponse<SerializedCompetitor>,
    AxiosError<Record<string, string[]>>,
    CompetitorVariables
  >({
    mutationFn,
    async onSuccess(response) {
      const data: Competitor[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedCompetitor = deserialize(response.data)

      queryClient.setQueryData(
        queryKey(eventId),
        data.map(competitor => (competitor.id === id ? updatedCompetitor : competitor))
      )
      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useUpdateCompetitorMutation
