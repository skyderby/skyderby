import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'

import { Place, elementEndpoint, recordQueryKey, allPlacesQueryKey } from './common'

const deletePlace = (id: number): Promise<AxiosResponse<Place>> =>
  client.delete<never, AxiosResponse<Place>>(elementEndpoint(id))

const useDeletePlaceMutation = (placeId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deletePlace(placeId)

  return useMutation<AxiosResponse<Place>, AxiosError<Record<string, string[]>>, void>({
    mutationFn,
    onSuccess() {
      const places = queryClient.getQueryData<Place[]>(allPlacesQueryKey) ?? []
      queryClient.setQueryData(
        allPlacesQueryKey,
        places.filter(place => place.id !== placeId)
      )
      queryClient.removeQueries({ queryKey: recordQueryKey(placeId) })
    }
  })
}

export default useDeletePlaceMutation
