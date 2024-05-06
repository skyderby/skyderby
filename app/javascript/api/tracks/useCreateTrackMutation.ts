import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import client from 'api/client'
import { TrackVariables, Track, recordQueryKey, trackSchema } from './common'

const createTrack = (track: TrackVariables) =>
  client
    .post<{ track: TrackVariables }>('/api/v1/tracks', { track })
    .then(response => trackSchema.parse(response.data))

const useCreateTrackMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<Track, AxiosError<Record<string, string[]>>, TrackVariables>({
    mutationFn: createTrack,
    onSuccess(track) {
      queryClient.setQueryData(recordQueryKey(track.id), track)
    }
  })
}

export default useCreateTrackMutation
