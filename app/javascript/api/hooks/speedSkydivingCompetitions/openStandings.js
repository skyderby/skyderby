import { useQuery } from 'react-query'
import axios from 'axios'

const endpoint = eventId =>
  `/api/v1/speed_skydiving_competitions/${eventId}/open_standings`

const getStandings = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'openStandings']

const queryFn = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getStandings(eventId).then(response => response.data)
}

export const openStandingsQuery = (eventId, options) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadOpenStandings = (eventId, queryClient) =>
  queryClient.prefetchQuery(openStandingsQuery(eventId))

export const useOpenStandingsQuery = (eventId, options) =>
  useQuery(openStandingsQuery(eventId, options))
