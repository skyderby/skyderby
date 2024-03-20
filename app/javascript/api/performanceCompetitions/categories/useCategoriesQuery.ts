import {
  QueryFunctionContext,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'

import client, { AxiosError } from 'api/client'
import { Category, QueryKey, indexSchema } from './common'

const endpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/categories`

const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'categories'
]

const getCategories = (eventId: number) =>
  client.get<never>(endpoint(eventId)).then(response => indexSchema.parse(response.data))

const queryFn = async (ctx: QueryFunctionContext<QueryKey>) => {
  const [_key, eventId] = ctx.queryKey
  return getCategories(eventId)
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
