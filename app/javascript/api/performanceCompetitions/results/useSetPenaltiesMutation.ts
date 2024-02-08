import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from 'api/client'
import type { Result } from './common'
import { elementEndpoint, queryKey, resultSchema } from './common'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'

export type PenaltyVariables = Pick<Result, 'penalized' | 'penaltySize' | 'penaltyReason'>

const penaltiesEndpoint = (eventId: number, id: number) =>
  `${elementEndpoint(eventId, id)}/penalties`

const updateResultPenalties = (eventId: number, id: number, penalty: PenaltyVariables) =>
  client
    .put<{ penalty: PenaltyVariables }>(penaltiesEndpoint(eventId, id), { penalty })
    .then(response => resultSchema.parse(response.data))

const useSetPenaltiesMutation = (eventId: number, resultId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: PenaltyVariables) =>
    updateResultPenalties(eventId, resultId, variables)

  return useMutation<Result, AxiosError<Record<string, string[]>>, PenaltyVariables>({
    mutationFn,
    async onSuccess(updatedResult) {
      const data = queryClient.getQueryData<Result[]>(queryKey(eventId)) ?? []

      queryClient.setQueryData(
        queryKey(eventId),
        data.map(record => (record.id === resultId ? updatedResult : record))
      )

      return queryClient.invalidateQueries({
        queryKey: standingsQuery(eventId).queryKey,
        refetchType: 'all'
      })
    }
  })
}

export default useSetPenaltiesMutation
