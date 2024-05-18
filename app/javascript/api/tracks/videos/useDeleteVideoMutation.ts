import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { trackQuery } from 'api/tracks/useTrackQuery'
import { queryKey, TrackVideo, videoUrl, videoSchema } from './common'
import { Track } from 'api/tracks'

const deleteVideo = async (id: number) =>
  client.delete(videoUrl(id)).then(response => videoSchema.parse(response.data))

const useDeleteVideoMutation = (trackId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteVideo(trackId)

  return useMutation<TrackVideo, AxiosError<Record<string, string[]>, undefined>, number>(
    {
      mutationFn,
      onSuccess(_response, trackId) {
        queryClient.removeQueries({ queryKey: queryKey(trackId), exact: true })

        const trackQueryKey = trackQuery(trackId).queryKey
        const trackData = queryClient.getQueryData<Track>(trackQueryKey)
        if (trackData)
          queryClient.setQueryData(
            trackQueryKey,
            Object.assign({}, trackData, { hasVideo: false })
          )
      }
    }
  )
}

export default useDeleteVideoMutation
