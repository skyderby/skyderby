import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import type { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'
import { standingsQuery } from 'api/speedSkydivingCompetitions/standings'
import { openStandingsQuery } from 'api/speedSkydivingCompetitions/openStandings'
import { teamStandingsQuery } from 'api/speedSkydivingCompetitions/teamStandings'
import type { Result, SerializedResult } from './common'
import { queryKey, deserialize, penaltiesEndpoint } from './common'

type PenaltiesVariables = {
  penaltiesAttributes: Result['penalties']
}

const updateResultPenalties = (
  eventId: number,
  id: number,
  penalties: PenaltiesVariables
) =>
  client.put<PenaltiesVariables, AxiosResponse<SerializedResult>>(
    penaltiesEndpoint(eventId, id),
    penalties
  )

const useSetResultPenaltiesMutation = (
  eventId: number,
  id: number
): UseMutationResult<
  AxiosResponse<SerializedResult>,
  AxiosError<Record<string, string[]>>,
  PenaltiesVariables
> => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: PenaltiesVariables) =>
    updateResultPenalties(eventId, id, variables)

  return useMutation({
    mutationFn,
    async onSuccess(response) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedResult = deserialize(response.data)
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(result => (result.id === id ? updatedResult : result))
      )

      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: standingsQuery(eventId).queryKey,
          refetchType: 'all'
        }),
        queryClient.invalidateQueries({
          queryKey: openStandingsQuery(eventId).queryKey,
          refetchType: 'all'
        }),
        queryClient.invalidateQueries({
          queryKey: teamStandingsQuery(eventId).queryKey,
          refetchType: 'all'
        })
      ])
    }
  })
}

export default useSetResultPenaltiesMutation
