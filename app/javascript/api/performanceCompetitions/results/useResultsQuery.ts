import type {
  QueryFunction,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult
} from '@tanstack/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import client from 'api/client'
import { Result, QueryKey } from './common'
import { collectionEndpoint, queryKey, resultsIndexSchema } from './common'

const getResults = (eventId: number) =>
  client
    .get<never>(collectionEndpoint(eventId))
    .then(response => resultsIndexSchema.parse(response.data))

const queryFn: QueryFunction<Result[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  return getResults(eventId)
}

export const resultsQuery = (eventId: number) => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useResultsQuery = <T = Result[]>(
  eventId: number,
  options: Omit<
    UseSuspenseQueryOptions<Result[], AxiosError, T, QueryKey>,
    'queryKey' | 'queryFn'
  > = {}
): UseSuspenseQueryResult<T> => useSuspenseQuery({ ...resultsQuery(eventId), ...options })

export default useResultsQuery
