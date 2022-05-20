import { QueryFunction, useQuery, UseQueryOptions, UseQueryResult } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'

import {
  cacheRelations,
  elementEndpoint,
  deserialize,
  recordQueryKey,
  TrackRecord,
  SerializedTrackRecord,
  RecordQueryKey,
  TrackRelations
} from './common'

const getTrack = (id: number) =>
  client
    .get<never, AxiosResponse<SerializedTrackRecord & { relations: TrackRelations }>>(
      elementEndpoint(id)
    )
    .then(response => response.data)

const queryFn: QueryFunction<TrackRecord, RecordQueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey

  const { relations, ...data } = await getTrack(id)

  cacheRelations(relations)

  return deserialize(data)
}

export const trackQuery = (
  id: number
): UseQueryOptions<TrackRecord, AxiosError, TrackRecord, RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn,
  enabled: Boolean(id)
})

const useTrackQuery = (id: number): UseQueryResult<TrackRecord, AxiosError> =>
  useQuery(trackQuery(id))

export default useTrackQuery
