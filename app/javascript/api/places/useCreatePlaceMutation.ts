import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'

import { Place, PlaceVariables, collectionEndpoint, recordQueryKey } from './common'

const createPlace = (place: PlaceVariables): Promise<AxiosResponse<Place>> =>
  client.post<{ place: PlaceVariables }, AxiosResponse<Place>>(collectionEndpoint, {
    place
  })

const useCreatePlaceMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    AxiosResponse<Place>,
    AxiosError<Record<string, string[]>>,
    PlaceVariables
  >({
    mutationFn: createPlace,
    onSuccess(response) {
      queryClient.setQueryData(recordQueryKey(response.data.id), response.data)
    }
  })
}

export default useCreatePlaceMutation
