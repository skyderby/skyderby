import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from 'api/client'
import { teamStandingsQuery, standingsQuery } from 'api/performanceCompetitions'
import { elementEndpoint, queryKey, Round, roundSchema } from './common'
import { AxiosError } from 'axios'

const deleteRound = (eventId: number, id: number) =>
  client
    .delete(elementEndpoint(eventId, id))
    .then(response => roundSchema.parse(response.data))

const useDeleteRoundMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteRound(eventId, id)

  return useMutation<Round, AxiosError<Record<string, string[]>>>({
    mutationFn,
    onSuccess() {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKey(eventId),
          refetchType: 'all'
        }),
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

export default useDeleteRoundMutation
