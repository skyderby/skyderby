import { useQuery, useMutation, useQueryClient } from 'react-query'

import axios from 'axios'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/competitors`

const getCompetitors = eventId => axios.get(endpoint(eventId))
const createCompetitor = ({ eventId, ...competitor }) => axios.post(endpoint(eventId), { competitor })

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'competitors']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getCompetitors(eventId)

  return data
}

const getQueryOptions = eventId => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadCompetitors = (eventId, queryClient) =>
  queryClient.prefetchQuery(getQueryOptions(eventId))

export const useCompetitorsQuery = eventId => useQuery(getQueryOptions(eventId))

export const useNewCompetitorMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createCompetitor, {
    onSuccess(response, eventId) {
      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(queryKey(eventId), [...data, response.data])
    }
  })
}
