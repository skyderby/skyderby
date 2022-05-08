import { useMutation, useQueryClient } from 'react-query'
import { AxiosResponse, AxiosError } from 'axios'
import client from 'api/client'
import {
  elementEndpoint,
  queryKey,
  deserialize,
  Result,
  SerializedResult
} from './common'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'

export type PenaltyVariables = Pick<Result, 'penalized' | 'penaltySize' | 'penaltyReason'>

const penaltiesEndpoint = (eventId: number, id: number) =>
  `${elementEndpoint(eventId, id)}/penalties`

const updateResultPenalties = (eventId: number, id: number, penalty: PenaltyVariables) =>
  client.put<{ penalty: PenaltyVariables }, AxiosResponse<SerializedResult>>(
    penaltiesEndpoint(eventId, id),
    { penalty }
  )

const useSetPenaltiesMutation = (eventId: number, resultId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: PenaltyVariables) =>
    updateResultPenalties(eventId, resultId, variables)

  return useMutation<
    AxiosResponse<SerializedResult>,
    AxiosError<Record<string, string[]>>,
    PenaltyVariables
  >(mutationFn, {
    async onSuccess(response) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedResult = deserialize(response.data)
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(record => (record.id === resultId ? updatedResult : record))
      )

      return queryClient.invalidateQueries(standingsQuery(eventId).queryKey, {
        refetchInactive: true
      })
    }
  })
}

export default useSetPenaltiesMutation
