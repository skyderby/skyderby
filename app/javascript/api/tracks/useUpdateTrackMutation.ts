import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { pointsQuery } from './points'
import {
  elementEndpoint,
  recordQueryKey,
  TrackVariables,
  trackResponseSchema,
  Track
} from './common'

const updateTrack = (id: number, track: TrackVariables) =>
  client
    .put<{ track: TrackVariables }>(elementEndpoint(id), { track })
    .then(response => trackResponseSchema.parse(response.data))

const useUpdateTrackMutation = (id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (changes: TrackVariables) => updateTrack(id, changes)

  return useMutation<Track, AxiosError<Record<string, string[]>>, TrackVariables>({
    mutationFn,
    onSuccess(track) {
      queryClient.setQueryData(recordQueryKey(id), track)
      return queryClient.invalidateQueries({
        queryKey: pointsQuery(id).queryKey,
        refetchType: 'all',
        exact: true
      })
    }
  })
}

export default useUpdateTrackMutation
