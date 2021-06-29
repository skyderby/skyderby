import { useMutation, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'
import { getCSRFToken } from 'utils/csrfToken'

import { placeQuery } from 'api/hooks/places'

const endpoint = '/api/v1/speed_skydiving_competitions'

const queryKey = id => ['speed_skydiving_competitions', id]

const getEvent = id => axios.get(`${endpoint}/${id}`)
const createEvent = speedSkydivingCompetition =>
  axios.post(
    endpoint,
    { speedSkydivingCompetition },
    { headers: { 'X-CSRF-Token': getCSRFToken() } }
  )

const getQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getEvent(id)

  if (data.placeId) {
    await queryClient.prefetchQuery(placeQuery(data.placeId, queryClient))
  }

  return data
}

const getQueryOptions = (id, queryClient) => ({
  queryKey: queryKey(id),
  queryFn: getQueryFn(queryClient),
  enabled: !!id
})

export const useNewSpeedSkydivingCompetitionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createEvent, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), response.data)
    }
  })
}

export const useSpeedSkydivingCompetitionQuery = id => {
  const queryClient = useQueryClient()
  return useQuery(getQueryOptions(id, queryClient))
}
