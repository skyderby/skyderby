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

type TrackChanges = {
  id: number
  changes: TrackFields
}

type RecordQueryKey = ['tracks', number | undefined]
const endpoint = (id: number) => `/api/v1/tracks/${id}`

const getTrack = (id: number): Promise<TrackRecord & { relations: TrackRelations }> =>
  axios.get(endpoint(id)).then(response => response.data)
const createTrack = (track: Partial<TrackFields>): Promise<AxiosResponse<TrackRecord>> =>
  axios.post('/api/v1/tracks', { track })
const updateTrack = ({
  id,
  changes
}: TrackChanges): Promise<AxiosResponse<TrackRecord>> =>
  axios.put(endpoint(id), { track: changes })
const deleteTrack = (id: number): Promise<TrackRecord> =>
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

  return data
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
  AxiosResponse<TrackRecord>,
  AxiosError,
  Partial<TrackFields>
> => {
  const queryClient = useQueryClient()

  return useMutation(createTrack, {
    onSuccess(response) {
      queryClient.setQueryData(recordQueryKey(response.data.id), response.data)
    }
  })
}

export const useEditTrackMutation = (): UseMutationResult<
  AxiosResponse<TrackRecord>,
  AxiosError,
  TrackChanges
> => {
  const queryClient = useQueryClient()

  return useMutation(updateTrack, {
    onSuccess(response, variables) {
      const id = variables.id

      queryClient.setQueryData(recordQueryKey(id), response.data)
      queryClient.invalidateQueries(pointsQuery(id).queryKey, { exact: true })
    }
  })
}

export const useDeleteTrackMutation = (): UseMutationResult<
  TrackRecord,
  AxiosError,
  number
> => useMutation(deleteTrack)
