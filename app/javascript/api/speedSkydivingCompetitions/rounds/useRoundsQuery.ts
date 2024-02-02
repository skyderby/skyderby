import { Round } from 'api/speedSkydivingCompetitions'
import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import client, { AxiosResponse } from 'api/client'
import queryClient from 'components/queryClient'
import { collectionEndpoint, QueryKey, queryKey, roundsIndexSchema } from './common'
import { AxiosError } from 'axios'

const getRounds = (eventId: number) =>
  client
    .get<never>(collectionEndpoint(eventId))
    .then(response => roundsIndexSchema.parse(response.data))

const queryFn: QueryFunction<Round[], QueryKey> = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getRounds(eventId)
}

type RoundsQueryOptions<T> = UseQueryOptions<Round[], AxiosError, T, QueryKey>

const roundsQuery = <T = Round[]>(eventId: number): RoundsQueryOptions<T> => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadRounds = (eventId: number): Promise<void> =>
  queryClient.prefetchQuery(roundsQuery(eventId))

const useRoundsQuery = <T = Round[]>(
  eventId: number,
  options: Omit<RoundsQueryOptions<T>, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<T> => useQuery({ ...roundsQuery<T>(eventId), ...options })

export default useRoundsQuery
