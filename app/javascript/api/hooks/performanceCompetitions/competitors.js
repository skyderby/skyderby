import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'
import { preloadProfiles } from 'api/hooks/profiles'

const endpoint = eventId => `/api/v1/performance_competitions/${eventId}/competitors`

const getCompetitors = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['performanceCompetition', eventId, 'competitors']

const buildQueryFn = queryClient => async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getCompetitors(eventId)

  const profileIds = data.map(record => record.profileId)
  await preloadProfiles(profileIds, queryClient)

  return data
}

const getQueryOptions = (eventId, queryClient) => ({
  queryKey: queryKey(eventId),
  queryFn: buildQueryFn(queryClient)
})

export const preloadCompetitors = (eventId, queryClient) =>
  queryClient.prefetchQuery(getQueryOptions(eventId, queryClient))

export const useCompetitorsQuery = eventId => {
  const queryClient = useQueryClient()

  return useQuery(getQueryOptions(eventId, queryClient))
}
