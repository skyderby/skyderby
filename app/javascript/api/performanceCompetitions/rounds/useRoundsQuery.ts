import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'

import {
  Round,
  QueryKey,
  roundsIndexSchema,
  queryKey,
  collectionEndpoint
} from './common'
import client from 'api/client'
import { AxiosError } from 'axios'

const getRounds = (eventId: number) => client.get<never>(collectionEndpoint(eventId))

const queryFn: QueryFunction<Round[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const response = await getRounds(eventId)
  return roundsIndexSchema.parse(response.data)
}

type RoundsQueryOptions<T> = UseQueryOptions<Round[], AxiosError, T, QueryKey>

export const roundsQuery = <T = Round[]>(eventId: number): RoundsQueryOptions<T> => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useRoundsQuery = <T = Round[]>(
  eventId: number,
  options: Omit<RoundsQueryOptions<T>, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<T> => useQuery({ ...roundsQuery<T>(eventId), ...options })

export default useRoundsQuery
