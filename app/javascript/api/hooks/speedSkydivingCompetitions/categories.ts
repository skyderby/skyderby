import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunction,
  QueryClient,
  UseQueryOptions,
  UseQueryResult,
  UseMutationResult
} from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { parseISO } from 'date-fns'

import { standingsQuery } from './standings'
import { getCSRFToken } from 'utils/csrfToken'
import { Category } from './types'

type SerializedCategory = {
  [K in keyof Category]: Category[K] extends Date ? string : Category[K]
}

type CreateVariables = {
  eventId: number
  name: string
}

type UpdateVariables = CreateVariables & {
  id: number
}

type DeleteVariables = {
  eventId: number
  id: number
}

type PositionVariables = {
  eventId: number
  id: number
  direction: 'up' | 'down'
}

type QueryKey = ['speedSkydivingCompetitions', number, 'categories']

type MutationOptions = {
  onSuccess?: (arg: Category) => unknown
}

const deserialize = (category: SerializedCategory): Category => ({
  ...category,
  createdAt: parseISO(category.createdAt),
  updatedAt: parseISO(category.updatedAt)
})

const endpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/categories`
const categoryUrl = (eventId: number, id: number) => `${endpoint(eventId)}/${id}`
const categoryPositionUrl = (eventId: number, id: number) =>
  `${categoryUrl(eventId, id)}/position`

const getHeaders = () => ({ 'X-CSRF-Token': getCSRFToken() })

const getCategories = (eventId: number) =>
  axios.get(endpoint(eventId)).then(response => response.data)
const createCategory = ({ eventId, ...category }: CreateVariables) =>
  axios.post(endpoint(eventId), { category }, { headers: getHeaders() })
const updateCategory = ({ eventId, id, ...category }: UpdateVariables) =>
  axios.put(categoryUrl(eventId, id), { category }, { headers: getHeaders() })
const deleteCategory = ({ eventId, id }: DeleteVariables) =>
  axios.delete(categoryUrl(eventId, id), { headers: getHeaders() })
const updateCategoryPosition = ({ eventId, id, direction }: PositionVariables) =>
  axios.put(categoryPositionUrl(eventId, id), { direction }, { headers: getHeaders() })

const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'categories'
]

const queryFn: QueryFunction<Category[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const categories = await getCategories(eventId)
  return categories.map(deserialize)
}

const categoriesQuery = <Type = Category[]>(
  eventId: number
): UseQueryOptions<Category[], Error, Type, QueryKey> => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadCategories = (
  eventId: number,
  queryClient: QueryClient
): Promise<void> => queryClient.prefetchQuery(categoriesQuery(eventId))

export const useCategoriesQuery = <Type = Category[]>(
  eventId: number,
  options: UseQueryOptions<Category[], Error, Type, QueryKey>
): UseQueryResult<Type> => useQuery({ ...categoriesQuery(eventId), ...options })

export const useCategoryQuery = (
  eventId: number,
  categoryId: number
): UseQueryResult<Category | undefined> =>
  useCategoriesQuery<Category | undefined>(eventId, {
    select: data => data.find(category => category.id === categoryId)
  })

export const useNewCategoryMutation = (
  eventId: number,
  options: MutationOptions = {}
) => {
  const queryClient = useQueryClient()

  const mutationFn = (values: Omit<CreateVariables, 'eventId'>) =>
    createCategory({ ...values, eventId })

  return useMutation(mutationFn, {
    async onSuccess(response) {
      const data: Category[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const category = deserialize(response.data)

      queryClient.setQueryData(queryKey(eventId), [...data, category])
      await queryClient.refetchQueries(standingsQuery(eventId))
      options.onSuccess?.(category)
    }
  })
}

export const useEditCategoryMutation = (
  eventId: number,
  options: MutationOptions = {}
) => {
  const queryClient = useQueryClient()

  const mutationFn = (values: Omit<UpdateVariables, 'eventId'>) =>
    updateCategory({ ...values, eventId })

  return useMutation(mutationFn, {
    onSuccess(response, { id }) {
      const data: Category[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedCategory = deserialize(response.data)

      queryClient.setQueryData(
        queryKey(eventId),
        data.map(category => (category.id === id ? updatedCategory : category))
      )
      options.onSuccess?.(updatedCategory)
    }
  })
}

export const useDeleteCategoryMutation = (
  options: MutationOptions = {}
): UseMutationResult<AxiosResponse<SerializedCategory>, AxiosError, DeleteVariables> => {
  const queryClient = useQueryClient()

  return useMutation(deleteCategory, {
    async onSuccess(response, { eventId }) {
      const category = deserialize(response.data)
      await Promise.all([
        queryClient.invalidateQueries(queryKey(eventId)),
        queryClient.refetchQueries(standingsQuery(eventId))
      ])
      options.onSuccess?.(category)
    }
  })
}

export const useChangePositionMutation = (): UseMutationResult<
  AxiosResponse<void>,
  AxiosError,
  PositionVariables
> => {
  const queryClient = useQueryClient()

  return useMutation(updateCategoryPosition, {
    onSuccess(response, { eventId }) {
      return queryClient.invalidateQueries(queryKey(eventId))
    }
  })
}
