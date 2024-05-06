import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import client from 'api/client'
import { videoUrl, queryKey, videoSchema, QueryKey, TrackVideo } from './common'

const getVideo = (id: number) =>
  client.get(videoUrl(id)).then(response => videoSchema.parse(response.data))

const queryFn = (ctx: QueryFunctionContext<QueryKey>) => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected track id to be a number, received ${typeof id}`)
  }

  return getVideo(id)
}

const useTrackVideoQuery = (
  id: number,
  options: Omit<
    UseQueryOptions<TrackVideo, AxiosError, TrackVideo, QueryKey>,
    'queryKey' | 'queryFn'
  > = {}
) =>
  useQuery<TrackVideo, AxiosError, TrackVideo, QueryKey>({
    queryKey: queryKey(id),
    queryFn,
    ...options
  })

export default useTrackVideoQuery
