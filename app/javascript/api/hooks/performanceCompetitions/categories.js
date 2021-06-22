import { useQuery } from 'react-query'
import axios from 'axios'

const endpoint = eventId => `/api/v1/performance_competitions/${eventId}/categories`

const getCategories = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['performanceCompetition', eventId, 'categories']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getCategories(eventId)

  return data
}

const getQueryOptions = eventId => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadCategories = (eventId, queryClient) =>
  queryClient.prefetchQuery(getQueryOptions(eventId, queryClient))

export const useCategoriesQuery = eventId => useQuery(getQueryOptions(eventId))
