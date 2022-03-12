import { QueryFunction, useQuery, UseQueryOptions } from 'react-query'
import { AxiosError } from 'axios'
import client from 'api/client'

import { Result } from './results'

type QueryKey = ['performanceCompetition', number, 'standings']

export interface StandingRow {
  rank: number
  totalPoints: number
  competitorId: number
  pointsInDisciplines: Record<string, number>
  roundResults: Record<string, Result>
}

export interface CategoryStandings {
  categoryId: number
  rows: StandingRow[]
}

const endpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/standings`

const getStandings = (eventId: number) =>
  client.get(endpoint(eventId)).then(response => response.data)

const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'standings'
]

const queryFn: QueryFunction<CategoryStandings[], QueryKey> = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getStandings(eventId)
}

type StandingsQueryOptions = UseQueryOptions<
  CategoryStandings[],
  AxiosError,
  CategoryStandings[],
  QueryKey
>

export const standingsQuery = (eventId: number): StandingsQueryOptions => ({
  queryKey: queryKey(eventId),
  queryFn
})

const useStandingsQuery = (eventId: number, options: StandingsQueryOptions = {}) =>
  useQuery({ ...standingsQuery(eventId), ...options })

export default useStandingsQuery
