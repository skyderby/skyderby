import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  UseSuspenseQueryOptions
} from '@tanstack/react-query'
import { AxiosResponse, AxiosError } from 'axios'

import client from 'api/client'
import {
  elementEndpoint,
  queryKey,
  QueryKey,
  PerformanceCompetition,
  SerializedPerformanceCompetition,
  deserialize
} from './common'
import { placeQuery } from 'api/places'

const getEvent = (id: number) =>
  client
    .get<never, AxiosResponse<SerializedPerformanceCompetition>>(elementEndpoint(id))
    .then(response => response.data)

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<PerformanceCompetition, QueryKey> => async ctx => {
  const [_key, id] = ctx.queryKey
  if (!id) throw new Error('id is required')
  const data = await getEvent(id)

  if (data.placeId) {
    await queryClient.prefetchQuery(placeQuery(data.placeId))
  }

  return deserialize(data)
}

const performanceCompetitionQuery = (
  id: number | undefined,
  queryClient: QueryClient
): UseSuspenseQueryOptions<
  PerformanceCompetition,
  AxiosError,
  PerformanceCompetition,
  QueryKey
> => ({
  queryKey: queryKey(id),
  queryFn: buildQueryFn(queryClient)
})

export const usePerformanceCompetitionQuery = (id: number | undefined) => {
  const queryClient = useQueryClient()
  return useQuery({ ...performanceCompetitionQuery(id, queryClient), enabled: !!id })
}

export const usePerformanceCompetitionSuspenseQuery = (id: number) => {
  const queryClient = useQueryClient()

  return useSuspenseQuery(performanceCompetitionQuery(id, queryClient))
}
