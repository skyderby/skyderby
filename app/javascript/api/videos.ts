import client from 'api/client'
import { QueryFunction, useQuery, UseQueryResult } from 'react-query'

import { VideoRecord } from './tracks/video'

const endpoint = '/api/v1/videos'

interface IndexParams {
  placeId?: number
}

interface VideosIndex {
  currentPage: number
  totalPages: number
  items: VideoRecord[]
}

type VideosQueryKey = ['videos', IndexParams]

const getVideos = async (params: IndexParams = {}): Promise<VideosIndex> => {
  const urlParams = new URLSearchParams()
  if (params.placeId) urlParams.set('placeId', String(params.placeId))

  const url = [endpoint, urlParams.toString()].join('?')

  return client.get(url).then(response => response.data)
}

const queryFn: QueryFunction<VideosIndex, VideosQueryKey> = ctx => {
  const [_key, params] = ctx.queryKey

  return getVideos(params)
}

const useVideosQuery = (params: IndexParams = {}): UseQueryResult<VideosIndex> => {
  return useQuery({
    queryKey: ['videos', params],
    queryFn
  })
}

export default useVideosQuery
