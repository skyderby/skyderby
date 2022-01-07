import {
  QueryClient,
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import client from 'api/client'

import { CompetitorStandingRow } from 'api/speedSkydivingCompetitions/types'

type QueryKey = ['speedSkydivingCompetitions', number, 'openStandings']

const endpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/open_standings`

const getStandings = (eventId: number) => client.get(endpoint(eventId))

const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'openStandings'
]

const queryFn: QueryFunction<CompetitorStandingRow[], QueryKey> = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getStandings(eventId).then(response => response.data)
}

type OptionsType = UseQueryOptions<
  CompetitorStandingRow[],
  Error,
  CompetitorStandingRow[],
  QueryKey
>

export const openStandingsQuery = (
  eventId: number,
  options: OptionsType = {}
): OptionsType => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadOpenStandings = (
  eventId: number,
  queryClient: QueryClient
): Promise<void> => queryClient.prefetchQuery(openStandingsQuery(eventId))

export const useOpenStandingsQuery = (
  eventId: number,
  options: OptionsType = {}
): UseQueryResult<CompetitorStandingRow[]> =>
  useQuery(openStandingsQuery(eventId, options))
