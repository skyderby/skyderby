import { AxiosError, AxiosResponse } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import client from 'api/client'
import { competitorsQuery, teamStandingsQuery } from 'api/performanceCompetitions'
import { elementUrl, queryKey, SerializedTeam, Team } from './common'

const deleteTeam = (eventId: number, id: number) =>
  client.delete<never, AxiosResponse<SerializedTeam>>(elementUrl(eventId, id))

const useDeleteTeamMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteTeam(eventId, id)

  return useMutation<
    AxiosResponse<SerializedTeam>,
    AxiosError<Record<string, string[]>>,
    undefined
  >(mutationFn, {
    async onSuccess() {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const data: Team[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      queryClient.setQueryData(
        queryKey(eventId),
        data.filter(team => team.id !== id)
      )
    }
  })
}

export default useDeleteTeamMutation
