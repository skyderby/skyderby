import { useMutation, useQueryClient } from 'react-query'
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

  const mutateFn = (changes: TrackVariables) => updateTrack(id, changes)

  return useMutation<
    AxiosResponse<SerializedTrack>,
    AxiosError<Record<string, string[]>>,
    TrackVariables
  >(mutateFn, {
    onSuccess(response) {
      const track = deserialize(response.data)

      queryClient.setQueryData(recordQueryKey(id), track)
      return queryClient.invalidateQueries(pointsQuery(id).queryKey, { exact: true })
    }
  })
}

export default useUpdateTrackMutation
