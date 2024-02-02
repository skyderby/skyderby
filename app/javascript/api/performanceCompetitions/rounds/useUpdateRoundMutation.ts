import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from 'api/client'
import { teamStandingsQuery, standingsQuery, Round } from 'api/performanceCompetitions'
import { elementEndpoint, queryKey, roundSchema } from './common'
import { AxiosError } from 'axios'

type Variables = {
  completed: boolean
}

const updateRound = (eventId: number, id: number, round: Variables) =>
  client
    .put<{ round: Variables }>(elementEndpoint(eventId, id), {
      round
    })
    .then(response => roundSchema.parse(response.data))

const useUpdateRoundMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (round: Variables) => updateRound(eventId, id, round)

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
          queryKey: teamStandingsQuery(eventId).queryKey,
          refetchType: 'all'
        }),
        queryClient.invalidateQueries({
          queryKey: standingsQuery(eventId).queryKey,
          refetchType: 'all'
        })
      ])
    }
  })
}

export default useUpdateRoundMutation
