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
    onSuccess(round) {
      const rounds = queryClient.getQueryData<Round[]>(queryKey(eventId)) ?? []
      queryClient.setQueryData(
        queryKey(eventId),
        rounds.map(item => (item.id === round.id ? round : item))
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
