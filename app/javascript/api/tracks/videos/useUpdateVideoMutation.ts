import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { Track, trackQuery } from 'api/tracks'
import { TrackVideo, videoSchema, videoUrl, queryKey } from './common'

type Variables = Omit<TrackVideo, 'trackId'>

const updateVideo = async (id: number, trackVideo: Variables) =>
  client
    .post(videoUrl(id), { trackVideo })
    .then(response => videoSchema.parse(response.data))

const useUpdateVideoMutation = (trackId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: Variables) => updateVideo(trackId, variables)

  return useMutation<TrackVideo, AxiosError<Record<string, string[]>>, Variables>({
    mutationFn,
    onSuccess(trackVideo) {
      queryClient.setQueryData(queryKey(trackId), trackVideo)

      const trackQueryKey = trackQuery(trackId).queryKey
      const trackData = queryClient.getQueryData<Track>(trackQueryKey)
      if (trackData)
        queryClient.setQueryData(
          trackQueryKey,
          Object.assign({}, trackData, { hasVideo: true })
        )
    }
  })
}

export default useUpdateVideoMutation
