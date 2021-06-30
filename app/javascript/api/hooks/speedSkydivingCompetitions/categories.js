import { useQuery, useMutation, useQueryClient } from 'react-query'

import axios from 'axios'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/categories`
const categoryUrl = (eventId, id) => `${endpoint(eventId)}/${id}`
const categoryPositionUrl = (eventId, id) => `${categoryUrl(eventId, id)}/position`

const getCategories = eventId => axios.get(endpoint(eventId))
const createCategory = ({ eventId, ...category }) =>
  axios.post(endpoint(eventId), { category })
const updateCategory = ({ eventId, id, ...category }) =>
  axios.put(categoryUrl(eventId, id), { category })
const deleteCategory = ({ eventId, id }) => axios.delete(categoryUrl(eventId, id))
const updateCategoryPosition = ({ eventId, id, direction }) =>
  axios.put(categoryPositionUrl(eventId, id), { direction })

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

export const useEditCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateCategory, {
    onSuccess(response, { eventId, id }) {
      queryClient.setQueryData(queryKey(eventId), categories =>
        categories.map(category => (category.id === id ? response.data : category))
      )
    }
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteCategory, {
    onSuccess(response, { eventId }) {
      return queryClient.invalidateQueries(queryKey(eventId))
    }
  })
}

export const useChangePositionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateCategoryPosition, {
    onSuccess(response, { eventId }) {
      return queryClient.invalidateQueries(queryKey(eventId))
    }
  })
}
