import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import client from 'api/client'
import { videoSchema } from './tracks'

const endpoint = '/api/v1/videos'

type IndexParams = {
  placeId?: number
}

const videoIndexSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  items: z.array(videoSchema)
})

type VideoIndexSchema = z.infer<typeof videoIndexSchema>

type VideosQueryKey = ['videos', IndexParams]

const getVideos = async (params: IndexParams = {}) => {
  const urlParams = new URLSearchParams()
  if (params.placeId) urlParams.set('placeId', String(params.placeId))

  const url = [endpoint, urlParams.toString()].join('?')

  return client
    .get(url)
    .then(response => response.data)
    .then(response => videoIndexSchema.parse(response.data))
}

const queryFn = (ctx: QueryFunctionContext<VideosQueryKey>) => {
  const [_key, params] = ctx.queryKey

  return getVideos(params)
}

const useVideosQuery = (params: IndexParams = {}) => {
  return useQuery<VideoIndexSchema, AxiosError, VideoIndexSchema, VideosQueryKey>({
    queryKey: ['videos', params],
    queryFn
  })
}

export default useVideosQuery
