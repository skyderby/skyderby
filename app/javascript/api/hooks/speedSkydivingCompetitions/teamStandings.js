import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadCompetitors } from './competitors'
import { preloadTeams } from './teams'

const endpoint = eventId =>
  `/api/v1/speed_skydiving_competitions/${eventId}/team_standings`

const getStandings = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'teamStandings']

const buildQueryFn = (queryClient, options) => async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getStandings(eventId)

  const preload = Object.fromEntries((options.preload || []).map(key => [key, true]))

  await Promise.all(
    [
      preload.competitors && preloadCompetitors(eventId, queryClient),
      preload.teams && preloadTeams(eventId, queryClient)
    ].filter(Boolean)
  )

  return data
}

export const teamStandingsQuery = (eventId, queryClient, options) => ({
  queryKey: queryKey(eventId),
  queryFn: buildQueryFn(queryClient, options)
})

export const useTeamStandingsQuery = (eventId, options) => {
  const queryClient = useQueryClient()

  return useQuery(teamStandingsQuery(eventId, queryClient, options))
}
