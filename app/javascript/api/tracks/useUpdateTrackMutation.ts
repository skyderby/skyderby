import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import { pointsQuery } from './points'
import {
  deserialize,
  elementEndpoint,
  recordQueryKey,
  TrackVariables,
  TrackRecord
} from './common'
import { Serialized } from 'api/helpers'

type SerializedTrack = Serialized<TrackRecord>

const updateTrack = (id: number, track: TrackVariables) =>
  client.put<{ track: TrackVariables }, AxiosResponse<SerializedTrack>>(
    elementEndpoint(id),
    { track }
  )

const useUpdateTrackMutation = (id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (changes: TrackVariables) => updateTrack(id, changes)

  return useMutation<
    AxiosResponse<SerializedTrack>,
    AxiosError<Record<string, string[]>>,
    TrackVariables
  >({
    mutationFn,
    onSuccess(response) {
      const track = deserialize(response.data)

      queryClient.setQueryData(recordQueryKey(id), track)
      return queryClient.invalidateQueries({
        queryKey: pointsQuery(id).queryKey,
        exact: true
      })
    }
  })
}

export default useUpdateTrackMutation
