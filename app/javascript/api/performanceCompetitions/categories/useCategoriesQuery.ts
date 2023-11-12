import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'

import client, { AxiosResponse, AxiosError } from 'api/client'
import { Category, SerializedCategory, QueryKey, deserialize } from './common'

const endpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/categories`

const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'categories'
]

const getCategories = (eventId: number) =>
  client
    .get<never, AxiosResponse<SerializedCategory[]>>(endpoint(eventId))
    .then(response => response.data)

const queryFn: QueryFunction<Category[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const categories = await getCategories(eventId)
  return categories.map(deserialize)
}

export const categoriesQuery = <T = Category[]>(
  eventId: number
): UseQueryOptions<Category[], AxiosError, T, QueryKey> => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useCategoriesQuery = <T = Category[]>(
  eventId: number,
  options: Omit<
    UseQueryOptions<Category[], AxiosError, T, QueryKey>,
    'queryKey' | 'queryFn'
  > = {}
): UseQueryResult<T> => useQuery({ ...categoriesQuery<T>(eventId), ...options })

export default useCategoriesQuery
