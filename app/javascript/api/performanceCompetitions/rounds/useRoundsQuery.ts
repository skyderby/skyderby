import { QueryFunction, useQuery, UseQueryOptions, UseQueryResult } from 'react-query'

import {
  Round,
  SerializedRound,
  QueryKey,
  queryKey,
  collectionEndpoint,
  deserialize
} from './common'
import client from 'api/client'
import { AxiosError, AxiosResponse } from 'axios'

const getRounds = (eventId: number) =>
  client
    .get<never, AxiosResponse<SerializedRound[]>>(collectionEndpoint(eventId))
    .then(response => response.data)

const queryFn: QueryFunction<Round[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const data = await getRounds(eventId)

  return data.map(deserialize)
}

type RoundsQueryOptions<T> = UseQueryOptions<Round[], AxiosError, T, QueryKey>

export const roundsQuery = <T = Round[]>(eventId: number): RoundsQueryOptions<T> => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useRoundsQuery = <T = Round[]>(
  eventId: number,
  options: RoundsQueryOptions<T> = {}
): UseQueryResult<T> => useQuery({ ...roundsQuery<T>(eventId), ...options })

export default useRoundsQuery
