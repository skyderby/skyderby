import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'

import {
  Place,
  PlaceVariables,
  elementEndpoint,
  recordQueryKey,
  allPlacesQueryKey
} from './common'

const updatePlace = (id: number, place: PlaceVariables): Promise<AxiosResponse<Place>> =>
  client.put<{ place: PlaceVariables }, AxiosResponse<Place>>(elementEndpoint(id), {
    place
  })

const useUpdatePlaceMutation = (placeId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (place: PlaceVariables) => updatePlace(placeId, place)

  return useMutation<
    AxiosResponse<Place>,
    AxiosError<Record<string, string[]>>,
    PlaceVariables
  >({
    mutationFn,
    onSuccess(response) {
      const places = queryClient.getQueryData<Place[]>(allPlacesQueryKey) ?? []
      queryClient.setQueryData(
        allPlacesQueryKey,
        places.map(place => (place.id === placeId ? response.data : place))
      )

      queryClient.setQueryData(recordQueryKey(response.data.id), response.data)
    }
  })
}

export default useUpdatePlaceMutation
