import { useQuery } from 'react-query'
import axios from 'axios'

const endpoint = eventId => `/api/v1/performance_competitions/${eventId}/rounds`

const getRounds = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['performanceCompetition', eventId, 'rounds']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  return getRounds(eventId).then(response => response.data)
}

const roundsQuery = (eventId, options = {}) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadRounds = (eventId, queryClient) =>
  queryClient.prefetchQuery(roundsQuery(eventId))

export const useRoundsQuery = (eventId, options) =>
  useQuery(roundsQuery(eventId, options))

export const useRoundQuery = (eventId, id) =>
  useQuery(roundsQuery(eventId, { select: data => data.find(round => round.id === id) }))
