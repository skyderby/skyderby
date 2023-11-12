import {
  QueryClient,
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import client from 'api/client'

import { CategoryStandings } from './types'

type QueryKey = ['speedSkydivingCompetitions', number, 'standings']

const endpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/standings`

const getStandings = (eventId: number) =>
  client.get(endpoint(eventId)).then(response => response.data)

const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'standings'
]

const queryFn: QueryFunction<CategoryStandings[], QueryKey> = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getStandings(eventId)
}

type OptionsType = UseQueryOptions<
  CategoryStandings[],
  Error,
  CategoryStandings[],
  QueryKey
>

export const standingsQuery = (
  eventId: number,
  options: Omit<OptionsType, 'queryKey' | 'queryFn'> = {}
): OptionsType => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadStandings = (
  eventId: number,
  queryClient: QueryClient
): Promise<void> => queryClient.prefetchQuery(standingsQuery(eventId))

export const useStandingsQuery = (
  eventId: number,
  options: Omit<OptionsType, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<CategoryStandings[]> => useQuery(standingsQuery(eventId, options))
