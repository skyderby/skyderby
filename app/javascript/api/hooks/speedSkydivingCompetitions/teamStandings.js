import { useQuery } from 'react-query'
import axios from 'axios'

const endpoint = eventId =>
  `/api/v1/speed_skydiving_competitions/${eventId}/team_standings`

const getStandings = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'teamStandings']

const queryFn = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getStandings(eventId).then(response => response.data)
}

export const teamStandingsQuery = (eventId, options) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadTeamStandings = (eventId, queryClient) =>
  queryClient.prefetchQuery(teamStandingsQuery(eventId))

export const useTeamStandingsQuery = (eventId, options) =>
  useQuery(teamStandingsQuery(eventId, options))
