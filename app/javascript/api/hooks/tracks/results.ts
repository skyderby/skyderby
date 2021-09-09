import axios from 'axios'
import { QueryFunction, useQuery, UseQueryOptions, UseQueryResult } from 'react-query'

type Task = 'distance' | 'speed' | 'time' | 'vertical_speed'

type ResultsRecord = {
  competitionResult: null | {
    eventId: number
    task: Task
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
    task: Task
    result: number
  }>
}

type ResultsQueryKey = ['trackResults', number | undefined]

const getResults = async (id: number) => {
  const { data } = await axios.get(`/api/v1/tracks/${id}/results`)
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
