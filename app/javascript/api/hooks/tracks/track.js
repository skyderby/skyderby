import { useMutation, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'
import { preloadPoints, queryKey as pointsQueryKey } from 'api/hooks/tracks/points'
import { preloadWindData } from 'api/hooks/tracks/windData'
import { preloadVideo } from 'api/hooks/tracks/video'

const endpoint = id => `/api/v1/tracks/${id}`

const getTrack = id => axios.get(endpoint(id))
const createTrack = track => axios.post('/api/v1/tracks', { track })
const updateTrack = ({ id, changes }) => axios.put(endpoint(id), { track: changes })
const deleteTrack = id => axios.delete(endpoint(id))

const buildQueryFn = (queryClient, opts = {}) => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getTrack(id)
  const preload = Object.fromEntries((opts.preload || []).map(key => [key, true]))

  await Promise.all([
    preload.points && preloadPoints(queryClient, id),
    preload.windData && preloadWindData(queryClient, id),
    data.hasVideo && preload.video && preloadVideo(queryClient, id)
  ])

  return data
}

export const queryKey = id => ['tracks', id]

export const useTrackQuery = (id, preload) => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: queryKey(id),
    queryFn: buildQueryFn(queryClient, preload),
    enabled: !!id
  })
}

export const useNewTrackMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createTrack, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), response.data)
    }
  })
}

export const useEditTrackMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateTrack, {
    onSuccess(response, variables) {
      const id = variables.id

      queryClient.setQueryData(queryKey(id), response.data)
      queryClient.invalidateQueries(pointsQueryKey(id), { exact: true })
    }
  })
}

export const useDeleteTrackMutation = () => useMutation(deleteTrack)
