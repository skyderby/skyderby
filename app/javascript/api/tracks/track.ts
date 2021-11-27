import {
  QueryClient,
  QueryFunction,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'

import { cacheRelations } from './utils'
import { pointsQuery } from 'api/tracks/points'
import { TrackRecord, TrackFields, TrackRelations } from './types'
import { parseISO } from 'date-fns'

type TrackChanges = {
  id: number
  changes: TrackFields
}

type SerializedTrackRecord = {
  [K in keyof TrackRecord]: TrackRecord[K] extends Date ? string : TrackRecord[K]
}

type RecordQueryKey = ['tracks', number | undefined]
const endpoint = (id: number) => `/api/v1/tracks/${id}`

const deserialize = (track: SerializedTrackRecord): TrackRecord => ({
  ...track,
  createdAt: parseISO(track.createdAt),
  updatedAt: parseISO(track.updatedAt),
  recordedAt: parseISO(track.recordedAt)
})

const getTrack = (
  id: number
): Promise<SerializedTrackRecord & { relations: TrackRelations }> =>
  axios.get(endpoint(id)).then(response => response.data)
const createTrack = (
  track: Partial<TrackFields>
): Promise<AxiosResponse<SerializedTrackRecord>> =>
  axios.post('/api/v1/tracks', { track })
const updateTrack = ({
  id,
  changes
}: TrackChanges): Promise<AxiosResponse<SerializedTrackRecord>> =>
  axios.put(endpoint(id), { track: changes })
const deleteTrack = (id: number): Promise<SerializedTrackRecord> =>
  axios.delete(endpoint(id)).then(response => response.data)

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<TrackRecord, RecordQueryKey> => async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected track id to be a number, received ${typeof id}`)
  }

  const { relations, ...data } = await getTrack(id)

  cacheRelations(relations, queryClient)

  return deserialize(data)
}

export const recordQueryKey = (id: number | undefined): RecordQueryKey => ['tracks', id]

export const trackQuery = (
  id: number | undefined,
  queryClient: QueryClient
): UseQueryOptions<TrackRecord, Error, TrackRecord, RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: Boolean(id)
})

export const useTrackQuery = (id: number | undefined): UseQueryResult<TrackRecord> => {
  const queryClient = useQueryClient()

  return useQuery(trackQuery(id, queryClient))
}

export const useNewTrackMutation = (): UseMutationResult<
  AxiosResponse<SerializedTrackRecord>,
  AxiosError,
  Partial<TrackFields>
> => {
  const queryClient = useQueryClient()

  return useMutation(createTrack, {
    onSuccess(response) {
      const track = deserialize(response.data)
      queryClient.setQueryData(recordQueryKey(response.data.id), track)
    }
  })
}

export const useEditTrackMutation = (): UseMutationResult<
  AxiosResponse<SerializedTrackRecord>,
  AxiosError,
  TrackChanges
> => {
  const queryClient = useQueryClient()

  return useMutation(updateTrack, {
    onSuccess(response, variables) {
      const id = variables.id
      const track = deserialize(response.data)

      queryClient.setQueryData(recordQueryKey(id), track)
      return queryClient.invalidateQueries(pointsQuery(id).queryKey, { exact: true })
    }
  })
}

export const useDeleteTrackMutation = (): UseMutationResult<
  SerializedTrackRecord,
  AxiosError,
  number
> => useMutation(deleteTrack)
