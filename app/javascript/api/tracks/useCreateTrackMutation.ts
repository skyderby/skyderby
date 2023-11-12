import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosResponse, AxiosError } from 'axios'
import client from 'api/client'
import {
  TrackVariables,
  SerializedTrackRecord,
  deserialize,
  recordQueryKey
} from './common'

const createTrack = (track: TrackVariables) =>
  client.post<{ track: TrackVariables }, AxiosResponse<SerializedTrackRecord>>(
    '/api/v1/tracks',
    { track }
  )

const useCreateTrackMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    AxiosResponse<SerializedTrackRecord>,
    AxiosError<Record<string, string[]>>,
    TrackVariables
  >({
    mutationFn: createTrack,
    onSuccess(response) {
      const track = deserialize(response.data)
      queryClient.setQueryData(recordQueryKey(response.data.id), track)
    }
  })
}

export default useCreateTrackMutation
