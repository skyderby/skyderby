import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'

import { PlaceRecord, elementEndpoint, recordQueryKey, allPlacesQueryKey } from './common'

const deletePlace = (id: number): Promise<AxiosResponse<PlaceRecord>> =>
  client.delete<never, AxiosResponse<PlaceRecord>>(elementEndpoint(id))

const useUpdatePlaceMutation = (placeId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deletePlace(placeId)

  return useMutation<
    AxiosResponse<PlaceRecord>,
    AxiosError<Record<string, string[]>>,
    void
  >({
    mutationFn,
    onSuccess() {
      const places = queryClient.getQueryData<PlaceRecord[]>(allPlacesQueryKey) ?? []
      queryClient.setQueryData(
        allPlacesQueryKey,
        places.filter(place => place.id !== placeId)
      )
      queryClient.removeQueries({ queryKey: recordQueryKey(placeId) })
    }
  })
}

export default useUpdatePlaceMutation
