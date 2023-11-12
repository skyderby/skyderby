import {
  QueryClient,
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import client from 'api/client'

import { TeamStandingRow } from './types'

type QueryKey = ['speedSkydivingCompetitions', number, 'teamStandings']

const endpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/team_standings`

const getStandings = (eventId: number) =>
  client.get(endpoint(eventId)).then(response => response.data)

const queryKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'teamStandings'
]

const queryFn: QueryFunction<TeamStandingRow[], QueryKey> = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getStandings(eventId)
}

type OptionsType = UseQueryOptions<TeamStandingRow[], Error, TeamStandingRow[], QueryKey>

export const teamStandingsQuery = (
  eventId: number,
  options: Omit<OptionsType, 'queryKey' | 'queryFn'> = {}
): OptionsType => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadTeamStandings = (
  eventId: number,
  queryClient: QueryClient
): Promise<void> => queryClient.prefetchQuery(teamStandingsQuery(eventId))

export const useTeamStandingsQuery = (
  eventId: number,
  options: Omit<OptionsType, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<TeamStandingRow[]> => useQuery(teamStandingsQuery(eventId, options))
