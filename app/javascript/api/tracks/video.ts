import axios, { AxiosError, AxiosResponse } from 'axios'
import {
  QueryFunction,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'

import { trackQuery } from 'api/tracks/track'
import { getCSRFToken } from 'utils/csrfToken'
import { TrackRecord } from 'api/tracks/types'

export interface VideoRecord {
  trackId: number
  url: string
  videoCode: string
  videoOffset: number
  trackOffset: number
}

interface VideoParams {
  id: number
  changes: Omit<VideoRecord, 'trackId'>
}

type VideoQueryKey = ['trackVideo', number | undefined]

const videoUrl = (id: number): string => `/api/v1/tracks/${id}/video`

const getVideo = async (id: number) => {
  const { data } = await axios.get(videoUrl(id))
  return data
}

const updateVideo = async ({
  id,
  changes
}: VideoParams): Promise<AxiosResponse<VideoRecord>> =>
  axios.post(
    videoUrl(id),
    { trackVideo: changes },
    { headers: { 'X-CSRF-Token': getCSRFToken() } }
  )

const deleteVideo = async (id: number) =>
  axios.delete(videoUrl(id), { headers: { 'X-CSRF-Token': getCSRFToken() } })

const queryFn: QueryFunction<VideoRecord, VideoQueryKey> = ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected track id to be a number, received ${typeof id}`)
  }

  return getVideo(id)
}

const queryKey = (id: number | undefined): VideoQueryKey => ['trackVideo', id]

const videoQuery = (
  id: number
): UseQueryOptions<VideoRecord, Error, VideoRecord, VideoQueryKey> => ({
  queryKey: queryKey(id),
  queryFn,
  enabled: !!id
})

export const useTrackVideoQuery = (
  id: number,
  options: UseQueryOptions<VideoRecord, Error, VideoRecord, VideoQueryKey> = {}
): UseQueryResult<VideoRecord> => useQuery({ ...videoQuery(id), ...options })

interface MutationOptions {
  onSuccess?: () => void
}

export const useEditVideoMutation = (
  options: MutationOptions = {}
): UseMutationResult<AxiosResponse<VideoRecord>, AxiosError, VideoParams> => {
  const queryClient = useQueryClient()

  return useMutation(updateVideo, {
    onSuccess(response, variables) {
      const trackId = variables.id
      const trackQueryKey = trackQuery(trackId, queryClient).queryKey

      queryClient.setQueryData(queryKey(trackId), response.data)

      if (trackQueryKey) {
        queryClient.setQueryData(
          trackQueryKey,
          (data: TrackRecord | undefined): TrackRecord =>
            Object.assign({}, data, { hasVideo: true })
        )
      } else {
        throw new Error('Received empty track query key while updating video')
      }
      options?.onSuccess?.()
    }
  })
}

export const useDeleteVideoMutation = (
  options: MutationOptions = {}
): UseMutationResult<AxiosResponse<VideoRecord>, AxiosError, number> => {
  const queryClient = useQueryClient()

  return useMutation(deleteVideo, {
    onSuccess(_response, trackId) {
      queryClient.removeQueries(queryKey(trackId), { exact: true })
      options?.onSuccess?.()
    }
  })
}
