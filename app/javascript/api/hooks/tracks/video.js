import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { queryKey as trackQueryKey } from 'api/hooks/tracks/track'

const videoUrl = id => `/api/v1/tracks/${id}/video`

const getVideo = async id => {
  const { data } = await axios.get(videoUrl(id))
  return data
}

const updateVideo = async ({ id, changes }) =>
  axios.post(videoUrl(id), { trackVideo: changes })

const deleteVideo = async id => axios.delete(videoUrl(id))

const queryFn = ctx => {
  const [_key, id] = ctx.queryKey
  return getVideo(id)
}

const queryKey = id => ['trackVideo', id]

const getQueryOptions = (id, opts = {}) => ({
  queryKey: queryKey(id),
  queryFn,
  enabled: !!id,
  ...opts
})

export const preloadVideo = (queryClient, id) =>
  queryClient.prefetchQuery(getQueryOptions(id))

export const useTrackVideoQuery = (id, opts) => useQuery(getQueryOptions(id, opts))

export const useEditVideoMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateVideo, {
    onSuccess(response, variables) {
      const trackId = variables.id

      queryClient.setQueryData(queryKey(trackId), response.data)
      queryClient.setQueryData(trackQueryKey(trackId), data => ({
        ...data,
        hasVideo: true
      }))
    }
  })
}

export const useDeleteVideoMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteVideo, {
    onSuccess(_response, trackId) {
      queryClient.removeQueries(queryKey(trackId), { exact: true })
    }
  })
}
