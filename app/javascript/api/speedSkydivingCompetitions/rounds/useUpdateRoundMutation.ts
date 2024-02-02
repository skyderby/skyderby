import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { standingsQuery } from 'api/speedSkydivingCompetitions/standings'
import { openStandingsQuery } from 'api/speedSkydivingCompetitions/openStandings'
import { teamStandingsQuery } from 'api/speedSkydivingCompetitions/teamStandings'
import { Round, roundSchema, recordEndpoint, queryKey } from './common'

type Variables = {
  completed: boolean
}

const updateRound = (eventId: number, roundId: number, round: Variables) =>
  client
    .put<{ round: Omit<Variables, 'eventId' | 'roundId'> }>(
      recordEndpoint(eventId, roundId),
      { round }
    )
    .then(response => roundSchema.parse(response.data))

const useUpdateRoundMutation = (eventId: number, roundId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (round: Variables) => updateRound(eventId, roundId, round)

  return useMutation<Round, AxiosError<Record<string, string[]>>, Variables>({
    mutationFn,
    onSuccess(updatedRound) {
      const data = queryClient.getQueryData<Round[]>(queryKey(eventId)) ?? []
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(round => (round.id === updatedRound.id ? updatedRound : round))
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

export default useUpdateRoundMutation
