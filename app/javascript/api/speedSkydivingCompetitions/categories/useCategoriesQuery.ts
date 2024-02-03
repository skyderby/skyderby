import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import queryClient from 'components/queryClient'
import client from 'api/client'
import {
  Category,
  collectionEndpoint,
  categoriesIndexSchema,
  queryKey,
  QueryKey
} from './common'

const getCategories = (eventId: number) =>
  client
    .get<never>(collectionEndpoint(eventId))
    .then(response => categoriesIndexSchema.parse(response.data))

const queryFn: QueryFunction<Category[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  return await getCategories(eventId)
}

type QueryOptions<T = Category[]> = UseQueryOptions<Category[], Error, T, QueryKey>

const categoriesQuery = <T = Category[]>(eventId: number): QueryOptions<T> => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadCategories = (eventId: number): Promise<void> =>
  queryClient.prefetchQuery(categoriesQuery(eventId))

const useCategoriesQuery = <T = Category[]>(
  eventId: number,
  options: Omit<QueryOptions<T>, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<T> => useQuery({ ...categoriesQuery<T>(eventId), ...options })

export default useCategoriesQuery
