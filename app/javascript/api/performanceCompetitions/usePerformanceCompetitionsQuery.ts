import { QueryFunction, useQuery, UseQueryOptions } from 'react-query'
import { PerformanceCompetition, collectionEndpoint } from './common'
import client, { AxiosResponse } from 'api/client'
import { urlWithParams } from 'api/helpers'

type IndexParams = {
  search?: string
  page?: number
  perPage?: number
}

type PerformanceCompetitionIndex = {
  items: PerformanceCompetition[]
  currentPage: number
  totalPages: number
}

type IndexQueryKey = ['performance_competitions', IndexParams]

const getPerformanceCompetitions = (params: IndexParams) =>
  client
    .get<never, AxiosResponse<PerformanceCompetitionIndex>>(
      urlWithParams(collectionEndpoint, params)
    )
    .then(response => response.data)

const queryFn: QueryFunction<PerformanceCompetitionIndex, IndexQueryKey> = ctx => {
  const [_key, params] = ctx.queryKey
  return getPerformanceCompetitions(params)
}

export const performanceCompetitionsQuery = (
  params: IndexParams = {}
): UseQueryOptions<
  PerformanceCompetitionIndex,
  Error,
  PerformanceCompetitionIndex,
  IndexQueryKey
> => ({
  queryKey: ['performance_competitions', params],
  queryFn
})

const usePerformanceCompetitionsQuery = (params: IndexParams = {}) =>
  useQuery(performanceCompetitionsQuery(params))

export default usePerformanceCompetitionsQuery
