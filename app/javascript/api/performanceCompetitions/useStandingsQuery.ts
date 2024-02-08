import { QueryFunction, UseQueryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { z } from 'zod'
import client from 'api/client'

type QueryKey = ['performanceCompetition', number, 'standings']

const roundResultSchema = z.object({
  id: z.number(),
  penalized: z.boolean(),
  points: z.number(),
  penaltyReason: z.string().nullable(),
  penaltySize: z.number().nullable()
})

const standingRowSchema = z.object({
  rank: z.number(),
  totalPoints: z.number(),
  competitorId: z.number(),
  pointsInDisciplines: z.record(z.number()),
  roundResults: z.record(roundResultSchema)
})

const categoryStandingsSchema = z.object({
  categoryId: z.number(),
  rows: z.array(standingRowSchema)
})

const standingsSchema = z.array(categoryStandingsSchema)

export type StandingRow = z.infer<typeof standingRowSchema>
export type CategoryStandings = z.infer<typeof categoryStandingsSchema>

const endpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/standings`

const getStandings = (eventId: number) =>
  client.get(endpoint(eventId)).then(response => standingsSchema.parse(response.data))

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

const useStandingsQuery = (
  eventId: number,
  options: Omit<StandingsQueryOptions, 'queryKey' | 'queryFn'> = {}
) => useSuspenseQuery({ ...standingsQuery(eventId), ...options })

export default useStandingsQuery
