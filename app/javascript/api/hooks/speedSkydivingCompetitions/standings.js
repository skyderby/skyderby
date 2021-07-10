import { useQuery } from 'react-query'
import axios from 'axios'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/standings`

const getStandings = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'standings']

const queryFn = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getStandings(eventId).then(response => response.data)
}

export const standingsQuery = (eventId, options) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadStandings = (eventId, queryClient) =>
  queryClient.prefetchQuery(standingsQuery(eventId))

export const useStandingsQuery = (eventId, options) =>
  useQuery(standingsQuery(eventId, options))
