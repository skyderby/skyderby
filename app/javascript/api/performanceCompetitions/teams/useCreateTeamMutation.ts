import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'
import { competitorsQuery, teamStandingsQuery } from 'api/performanceCompetitions'
import {
  Team,
  TeamVariables,
  SerializedTeam,
  collectionUrl,
  deserialize,
  queryKey
} from './common'

const createTeam = (eventId: number, team: TeamVariables) =>
  client.post<{ team: TeamVariables }, AxiosResponse<SerializedTeam>>(
    collectionUrl(eventId),
    { team }
  )

const useCreateTeamMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (team: TeamVariables) => createTeam(eventId, team)

  return useMutation<
    AxiosResponse<SerializedTeam>,
    AxiosError<Record<string, string[]>>,
    TeamVariables
  >({
    mutationFn,
    async onSuccess(response) {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const team = deserialize(response.data)
      const data: Team[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      queryClient.setQueryData(queryKey(eventId), [...data, team])
    }
  })
}

export default useCreateTeamMutation
