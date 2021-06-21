import { useMutation, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { getQueryOptions as getPlaceQueryOptions } from 'api/hooks/places'

const endpoint = '/api/v1/performance_competitions'

const queryKey = id => ['performance_competitions', id]

const getEvent = id => axios.get(`${endpoint}/${id}`)
const createEvent = performanceCompetition => axios.post(endpoint, { performanceCompetition })

const getQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getEvent(id)

  if (data.placeId) {
    await queryClient.prefetchQuery(getPlaceQueryOptions(data.placeId, queryClient))
  }

  return data
}

const getQueryOptions = (id, queryClient) => ({
  queryKey: queryKey(id),
  queryFn: getQueryFn(queryClient),
  enabled: !!id
})

export const useNewPerformanceEventMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createEvent, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), response.data)
    }
  })
}

export const usePerformanceEventQuery = id => {
  const queryClient = useQueryClient()
  return useQuery(getQueryOptions(id, queryClient))
}
