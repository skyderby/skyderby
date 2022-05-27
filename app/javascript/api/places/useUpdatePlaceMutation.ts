import { useMutation, useQueryClient } from 'react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'

import {
  PlaceRecord,
  PlaceVariables,
  elementEndpoint,
  recordQueryKey,
  allPlacesQueryKey
} from './common'

const updatePlace = (
  id: number,
  place: PlaceVariables
): Promise<AxiosResponse<PlaceRecord>> =>
  client.put<{ place: PlaceVariables }, AxiosResponse<PlaceRecord>>(elementEndpoint(id), {
    place
  })

const useUpdatePlaceMutation = (placeId: number) => {
  const queryClient = useQueryClient()

  const mutateFn = (place: PlaceVariables) => updatePlace(placeId, place)

  return useMutation<
    AxiosResponse<PlaceRecord>,
    AxiosError<Record<string, string[]>>,
    PlaceVariables
  >(mutateFn, {
    onSuccess(response) {
      const places = queryClient.getQueryData<PlaceRecord[]>(allPlacesQueryKey) ?? []
      queryClient.setQueryData(
        allPlacesQueryKey,
        places.map(place => (place.id === placeId ? response.data : place))
      )

      queryClient.setQueryData(recordQueryKey(response.data.id), response.data)
    }
  })
}

export default useUpdatePlaceMutation
