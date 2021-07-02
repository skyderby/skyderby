import { useQuery } from 'react-query'
import axios from 'axios'

const endpoint = eventId => `/api/v1/performance_competitions/${eventId}/rounds`

const getRounds = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['performanceCompetition', eventId, 'rounds']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getRounds(eventId)

  return data
}

const getQueryOptions = eventId => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadRounds = (eventId, queryClient) =>
  queryClient.prefetchQuery(getQueryOptions(eventId))

export const useRoundsQuery = eventId => useQuery(getQueryOptions(eventId))