import {
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import client from 'api/client'

export interface SuitStatsRecord {
  suitId: number
  profiles: number
  baseTracks: number
  skydiveTracks: number
}

const endpoint = '/api/v1/suits/stats'

type QueryKey = ['suitStats', number]

const queryKey = (id: number): QueryKey => ['suitStats', id]

const getStats = (ids: number[] = []): Promise<SuitStatsRecord[]> => {
  const params = new URLSearchParams()
  ids.forEach(id => params.append('ids[]', String(id)))

  const url = `${endpoint}?${params.toString()}`

  return client.get(url).then(response => response.data)
}

const suitStatsQueryFn: QueryFunction<SuitStatsRecord, QueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey
  const stats = await getStats([id])

  return stats[0]
}

export const useSuitsStats = async (ids: number[]): Promise<void> => {
  const queryClient = useQueryClient()

  const missingIds = ids.filter(
    id => queryClient.getQueryData(queryKey(id)) === undefined
  )

  const suitStats = await getStats(missingIds)
  suitStats.forEach(record => {
    queryClient.setQueryData(queryKey(record.suitId), record)
  })
}

export const useSuitStatsQuery = (
  id: number,
  options: Omit<
    UseQueryOptions<SuitStatsRecord, Error, SuitStatsRecord, QueryKey>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<SuitStatsRecord | undefined> =>
  useQuery({
    queryKey: queryKey(id),
    queryFn: suitStatsQueryFn,
    ...options
  })
