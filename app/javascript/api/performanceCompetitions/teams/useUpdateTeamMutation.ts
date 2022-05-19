import { useMutation, useQueryClient } from 'react-query'
import client, { AxiosResponse } from 'api/client'
import {
  TeamVariables,
  elementUrl,
  SerializedTeam,
  deserialize,
  Team,
  queryKey
} from './common'
import { competitorsQuery, teamStandingsQuery } from 'api/performanceCompetitions'
import { AxiosError } from 'axios'

const updateTeam = (eventId: number, id: number, team: TeamVariables) =>
  client.put<{ team: TeamVariables }, AxiosResponse<SerializedTeam>>(
    elementUrl(eventId, id),
    { team }
  )

const useUpdateTeamMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutateFn = (team: TeamVariables) => updateTeam(eventId, id, team)

  return useMutation<
    AxiosResponse<SerializedTeam>,
    AxiosError<Record<string, string[]>>,
    TeamVariables
  >(mutateFn, {
    async onSuccess(response) {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const updatedTeam = deserialize(response.data)
      const data: Team[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(team => (team.id === id ? updatedTeam : team))
      )
    }
  })
}

export default useUpdateTeamMutation
