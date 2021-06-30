import { useQuery, useMutation, useQueryClient } from 'react-query'

import axios from 'axios'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/categories`

const getCategories = eventId => axios.get(endpoint(eventId))
const createCategory = ({ eventId, ...category }) =>
  axios.post(endpoint(eventId), { category })

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'categories']

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
  queryClient.prefetchQuery(getQueryOptions(eventId))

export const useCategoriesQuery = eventId => useQuery(getQueryOptions(eventId))

export const useNewCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createCategory, {
    onSuccess(response, { eventId }) {
      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(queryKey(eventId), [...data, response.data])
    }
  })
}
