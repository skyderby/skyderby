import client from 'api/client'
import { QueryFunction, useQuery, UseQueryOptions, UseQueryResult } from 'react-query'

export type Task =
  | 'distance'
  | 'speed'
  | 'time'
  | 'vertical_speed'
  | 'distance_in_time'
  | 'distance_in_altitude'
  | 'flare'
  | 'base_race'

export interface ResultsRecord {
  competitionResult: null | {
    eventId: number
    eventName: string
    eventType: 'performance' | 'speed_skydiving' | 'boogie' | 'tournament'
    task: Task
    result: number
  }
  bestResults: Array<{
    task: Task
    result: number
    rangeFrom: number
    rangeTo: number
  }>
  totalResults: Array<{
    task: Task
    result: number
  }>
  onlineRankingResults: Array<{
    rankingId: number
    rankingName: string
    groupName: string
    task: Task
    result: number
  }>
}

type ResultsQueryKey = ['trackResults', number | undefined]

const getResults = async (id: number) => {
  const { data } = await client.get(`/api/v1/tracks/${id}/results`)
  return data
}

const queryFn: QueryFunction<ResultsRecord, ResultsQueryKey> = ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected track id to be a number, received ${typeof id}`)
  }

  return getResults(id)
}

const resultsQuery = (
  id: number | undefined
): UseQueryOptions<ResultsRecord, Error, ResultsRecord, ResultsQueryKey> => ({
  queryKey: ['trackResults', id],
  queryFn,
  enabled: Boolean(id)
})

export const useTrackResults = (id: number | undefined): UseQueryResult<ResultsRecord> =>
  useQuery(resultsQuery(id))
