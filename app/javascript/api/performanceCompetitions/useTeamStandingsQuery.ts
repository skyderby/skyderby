import { QueryFunction, useQuery, UseQueryOptions } from '@tanstack/react-query'
import client from 'api/client'
import { AxiosError } from 'axios'

interface TeamStandingRow {
  rank: number
  teamId: number
  total: number
}

type QueryKey = ['performanceCompetition', number, 'teamStandings']

const endpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/team_standings`

const getStandings = (eventId: number) =>
  client.get(endpoint(eventId)).then(response => response.data)

const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'teamStandings'
]

const queryFn: QueryFunction<TeamStandingRow[], QueryKey> = ctx => {
  const [_key, eventId] = ctx.queryKey

  return getStandings(eventId)
}

type Options = UseQueryOptions<
  TeamStandingRow[],
  AxiosError<Record<string, string[]>>,
  TeamStandingRow[],
  QueryKey
>

export const teamStandingsQuery = (
  eventId: number,
  options: Omit<Options, 'queryKey' | 'queryFn'> = {}
): Options => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

const useTeamStandingsQuery = (
  eventId: number,
  options: Omit<Options, 'queryKey' | 'queryFn'> = {}
) => useQuery(teamStandingsQuery(eventId, options))

export default useTeamStandingsQuery
