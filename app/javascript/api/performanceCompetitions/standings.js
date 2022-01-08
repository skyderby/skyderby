import { useQuery } from 'react-query'
import client from 'api/client'

const endpoint = eventId => `/api/v1/performance_competitions/${eventId}/standings`

const getStandings = eventId => client.get(endpoint(eventId))

const queryKey = eventId => ['performanceCompetition', eventId, 'standings']

const queryFn = async ctx => {
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
