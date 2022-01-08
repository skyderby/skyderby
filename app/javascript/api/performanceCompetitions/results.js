import { useQuery } from 'react-query'
import client from 'api/client'

const endpoint = eventId => `/api/v1/performance_competitions/${eventId}/results`

const getResults = eventId => client.get(endpoint(eventId))

const queryKey = eventId => ['performanceCompetition', eventId, 'results']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getResults(eventId)

  return data
}

const resultsQuery = (eventId, options = {}) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadResults = (eventId, queryClient) =>
  queryClient.prefetchQuery(resultsQuery(eventId))

export const useResultsQuery = eventId => useQuery(resultsQuery(eventId))

export const useResultQuery = (eventId, id) =>
  useQuery(
    resultsQuery(eventId, { select: data => data.find(result => result.id === id) })
  )
