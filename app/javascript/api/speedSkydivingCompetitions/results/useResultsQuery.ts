import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import client, { AxiosResponse } from 'api/client'
import {
  Result,
  QueryKey,
  SerializedResult,
  collectionEndpoint,
  deserialize,
  queryKey
} from './common'

const getResults = (eventId: number) =>
  client
    .get<never, AxiosResponse<SerializedResult[]>>(collectionEndpoint(eventId))
    .then(response => response.data)

const queryFn: QueryFunction<Result[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const results = await getResults(eventId)
  return results.map(deserialize)
}

export const resultsQuery = <Type = Result[]>(
  eventId: number
): UseQueryOptions<Result[], Error, Type, QueryKey> => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useResultsQuery = <Type = Result[]>(
  eventId: number,
  options: Omit<UseQueryOptions<Result[], Error, Type, QueryKey>, 'queryKey' | 'queryFn'>
): UseQueryResult<Type> => useQuery({ ...resultsQuery<Type>(eventId), ...options })

export default useResultsQuery
