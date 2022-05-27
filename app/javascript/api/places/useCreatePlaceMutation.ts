import { useMutation, useQueryClient } from 'react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'

import { PlaceRecord, PlaceVariables, collectionEndpoint, recordQueryKey } from './common'

const createPlace = (place: PlaceVariables): Promise<AxiosResponse<PlaceRecord>> =>
  client.post<{ place: PlaceVariables }, AxiosResponse<PlaceRecord>>(collectionEndpoint, {
    place
  })

const useCreatePlaceMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    AxiosResponse<PlaceRecord>,
    AxiosError<Record<string, string[]>>,
    PlaceVariables
  >(createPlace, {
    onSuccess(response) {
      queryClient.setQueryData(recordQueryKey(response.data.id), response.data)
    }
  })
}

export default useCreatePlaceMutation
