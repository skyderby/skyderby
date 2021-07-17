import { useMutation, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { placeQuery } from 'api/hooks/places'

const endpoint = '/api/v1/performance_competitions'

const queryKey = id => ['performance_competitions', id]

const getEvent = id => axios.get(`${endpoint}/${id}`)
const createEvent = performanceCompetition =>
  axios.post(endpoint, { performanceCompetition })

const getQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getEvent(id)

  if (data.placeId) {
    await queryClient.prefetchQuery(placeQuery(data.placeId, queryClient))
  }

  return data
}

const performanceEventQuery = (id, queryClient) => ({
  queryKey: queryKey(id),
  queryFn: getQueryFn(queryClient),
  enabled: !!id
})

export const preloadPerformanceEvent = (id, queryClient) =>
  queryClient.prefetchQuery(performanceEventQuery(id, queryClient))

export const usePerformanceEventQuery = id => {
  const queryClient = useQueryClient()
  return useQuery(performanceEventQuery(id, queryClient))
}

export const useNewPerformanceEventMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createEvent, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), response.data)
    }
  })
}
