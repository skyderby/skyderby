import { useMutation, UseMutationResult, useQueryClient } from 'react-query'

import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import client, { AxiosResponse, AxiosError } from 'api/client'
import {
  collectionEndpoint,
  queryKey,
  CompetitorVariables,
  SerializedCompetitor,
  Competitor,
  deserialize
} from './common'

const createCompetitor = (eventId: number, competitor: CompetitorVariables) =>
  client.post<{ competitor: CompetitorVariables }, AxiosResponse<SerializedCompetitor>>(
    collectionEndpoint(eventId),
    { competitor }
  )

const useNewCompetitorMutation = (
  eventId: number
): UseMutationResult<
  AxiosResponse<SerializedCompetitor>,
  AxiosError,
  CompetitorVariables
> => {
  const queryClient = useQueryClient()

  const mutationFn = (competitor: CompetitorVariables) =>
    createCompetitor(eventId, competitor)

  return useMutation(mutationFn, {
    async onSuccess(response) {
      const data: Competitor[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const competitor = deserialize(response.data)

      queryClient.setQueryData(queryKey(eventId), [...data, competitor])

      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useNewCompetitorMutation
