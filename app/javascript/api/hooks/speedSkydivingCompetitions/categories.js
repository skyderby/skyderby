import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'

import { standingsQuery } from './standings'
import { getCSRFToken } from 'utils/csrfToken'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/categories`
const categoryUrl = (eventId, id) => `${endpoint(eventId)}/${id}`
const categoryPositionUrl = (eventId, id) => `${categoryUrl(eventId, id)}/position`

const getHeaders = () => ({ 'X-CSRF-Token': getCSRFToken() })

const getCategories = eventId => axios.get(endpoint(eventId))
const createCategory = ({ eventId, ...category }) =>
  axios.post(endpoint(eventId), { category }, { headers: getHeaders() })
const updateCategory = ({ eventId, id, ...category }) =>
  axios.put(categoryUrl(eventId, id), { category }, { headers: getHeaders() })
const deleteCategory = ({ eventId, id }) =>
  axios.delete(categoryUrl(eventId, id), { headers: getHeaders() })
const updateCategoryPosition = ({ eventId, id, direction }) =>
  axios.put(categoryPositionUrl(eventId, id), { direction }, { headers: getHeaders() })

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'categories']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getCategories(eventId)

  return data
}

const categoriesQuery = (eventId, options = {}) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadCategories = (eventId, queryClient) =>
  queryClient.prefetchQuery(categoriesQuery(eventId))

export const useCategoriesQuery = (eventId, options) =>
  useQuery(categoriesQuery(eventId, options))

export const useCategoryQuery = (eventId, categoryId) =>
  useCategoriesQuery(eventId, {
    select: data => data.find(category => category.id === categoryId)
  })

export const useNewCategoryMutation = (eventId, options = {}) => {
  const queryClient = useQueryClient()

  const mutationFn = values => createCategory({ ...values, eventId })

  return useMutation(mutationFn, {
    async onSuccess(response) {
      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(queryKey(eventId), [...data, response.data])
      await queryClient.refetchQueries(standingsQuery(eventId, queryClient))
      options.onSuccess?.()
    }
  })
}

export const useEditCategoryMutation = (eventId, options = {}) => {
  const queryClient = useQueryClient()

  const mutationFn = values => updateCategory({ ...values, eventId })

  return useMutation(mutationFn, {
    onSuccess(response, { id }) {
      queryClient.setQueryData(queryKey(eventId), categories =>
        categories.map(category => (category.id === id ? response.data : category))
      )
      options.onSuccess?.()
    }
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteCategory, {
    onSuccess(response, { eventId }) {
      queryClient.invalidateQueries(queryKey(eventId))
      queryClient.refetchQueries(standingsQuery(eventId, queryClient))
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
