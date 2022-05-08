import { QueryFunction, useQuery, UseQueryOptions, UseQueryResult } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'

import client from 'api/client'
import {
  collectionEndpoint,
  queryKey,
  deserialize,
  Result,
  SerializedResult,
  QueryKey
} from './common'

const getResults = (eventId: number) =>
  client
    .get<never, AxiosResponse<SerializedResult[]>>(collectionEndpoint(eventId))
    .then(response => response.data)

const queryFn: QueryFunction<Result[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const data = await getResults(eventId)

  return data.map(deserialize)
}

export const resultsQuery = (eventId: number) => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useResultsQuery = <T = Result[]>(
  eventId: number,
  options: UseQueryOptions<Result[], AxiosError, T, QueryKey> = {}
): UseQueryResult<T> => useQuery({ ...resultsQuery(eventId), ...options })

export default useResultsQuery
