import {
  QueryFunction,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
  useSuspenseQuery
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

const getRounds = (eventId: number) =>
  client
    .get<never>(collectionEndpoint(eventId))
    .then(response => roundsIndexSchema.parse(response.data))

const queryFn: QueryFunction<Round[], QueryKey> = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getRounds(eventId)
}

type RoundsQueryOptions<T> = UseSuspenseQueryOptions<Round[], AxiosError, T, QueryKey>

export const roundsQuery = <T = Round[]>(eventId: number): RoundsQueryOptions<T> => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useRoundsQuery = <T = Round[]>(
  eventId: number,
  options: Omit<RoundsQueryOptions<T>, 'queryKey' | 'queryFn'> = {}
): UseSuspenseQueryResult<T> =>
  useSuspenseQuery({ ...roundsQuery<T>(eventId), ...options })

export default useRoundsQuery
