import { useSuspenseQuery, QueryFunction, UseQueryOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import client from 'api/client'

import {
  cacheRelations,
  elementEndpoint,
  recordQueryKey,
  trackResponseSchema,
  RecordQueryKey,
  Track
} from './common'

const getTrack = (id: number) =>
  client
    .get<never>(elementEndpoint(id))
    .then(response => trackResponseSchema.parse(response.data))

const queryFn: QueryFunction<Track, RecordQueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey

  const { relations, ...data } = await getTrack(id)

  cacheRelations(relations)

  return data
}

export const trackQuery = (
  id: number
): UseQueryOptions<Track, AxiosError, Track, RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn
})

const useTrackQuery = (id: number) =>
  useSuspenseQuery<Track, AxiosError, Track, RecordQueryKey>(trackQuery(id))

export default useTrackQuery
