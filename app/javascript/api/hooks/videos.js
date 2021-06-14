import axios from 'axios'
import { useQuery } from 'react-query'

const endpoint = '/api/v1/videos'

const getVideos = async (params = {}) => {
  const urlParams = new URLSearchParams()
  if (params.placeId) urlParams.set('placeId', params.placeId)

  const { data } = await axios.get([endpoint, urlParams.toString()].join('?'))

  return data
}

const queryFn = ctx => {
  const [_key, params] = ctx.queryKey

  return getVideos(params)
}

const useVideosQuery = params => {
  return useQuery({
    queryKey: ['videos', params],
    queryFn
  })
}

export default useVideosQuery
