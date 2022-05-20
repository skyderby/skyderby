import { useMutation } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'
import { Serialized } from 'api/helpers'
import { elementEndpoint, TrackRecord } from './common'

const deleteTrack = (id: number) =>
  client
    .delete<never, AxiosResponse<Serialized<TrackRecord>>>(elementEndpoint(id))
    .then(response => response.data)

const useDeleteTrackMutation = (id: number) => {
  const mutateFn = () => deleteTrack(id)

  return useMutation<Serialized<TrackRecord>, AxiosError<Record<string, string[]>>>(
    mutateFn
  )
}

export default useDeleteTrackMutation
