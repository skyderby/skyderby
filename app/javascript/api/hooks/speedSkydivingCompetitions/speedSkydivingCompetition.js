import { useMutation, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'
import { getCSRFToken } from 'utils/csrfToken'

import { placeQuery } from 'api/hooks/places'

const endpoint = '/api/v1/speed_skydiving_competitions'

const queryKey = id => ['speedSkydivingCompetitions', id]

const getEvent = id => axios.get(`${endpoint}/${id}`)
const createEvent = speedSkydivingCompetition =>
  axios.post(
    endpoint,
    { speedSkydivingCompetition },
    { headers: { 'X-CSRF-Token': getCSRFToken() } }
  )
const updateEvent = ({ id, ...speedSkydivingCompetition }) =>
  axios.put(
    `${endpoint}/${id}`,
    { speedSkydivingCompetition },
    { headers: { 'X-CSRF-Token': getCSRFToken() } }
  )

const buildQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getEvent(id)

  if (data.placeId) {
    await queryClient.prefetchQuery(placeQuery(data.placeId, queryClient))
  }

  return data
}

export const speedSkydivingCompetitionQuery = (id, queryClient) => ({
  queryKey: queryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: !!id
})

export const preloadSpeedSkydivingCompetition = (id, queryClient) =>
  queryClient.prefetchQuery(speedSkydivingCompetitionQuery(id, queryClient))

export const useSpeedSkydivingCompetitionQuery = id => {
  const queryClient = useQueryClient()
  return useQuery(speedSkydivingCompetitionQuery(id, queryClient))
}

export const useNewSpeedSkydivingCompetitionMutation = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation(createEvent, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), response.data)
      options.onSuccess?.(response.data)
    }
  })
}

export const useEditSpeedSkydivingCompetitionMutation = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation(updateEvent, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), response.data)
      options.onSuccess?.()
    }
  })
}
