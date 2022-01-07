import { useMutation, UseMutationResult, useQueryClient } from 'react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import { PlaceRecord } from './types'

import { endpoint, recordQueryKey } from './utils'

export type CreateVariables = {
  [K in keyof Omit<PlaceRecord, 'id' | 'cover' | 'photos'>]: string | null
}

export type NewPlaceMutation = UseMutationResult<
  AxiosResponse<PlaceRecord>,
  AxiosError,
  CreateVariables
>
type MutationOptions = {
  onSuccess: (place: PlaceRecord) => unknown
}

const createPlace = (place: CreateVariables): Promise<AxiosResponse<PlaceRecord>> =>
  client.post<{ place: CreateVariables }, AxiosResponse<PlaceRecord>>(endpoint, { place })

const useNewPlaceMutation = (options: MutationOptions): NewPlaceMutation => {
  const queryClient = useQueryClient()

  return useMutation(createPlace, {
    onSuccess(response) {
      queryClient.setQueryData(recordQueryKey(response.data.id), response.data)
      options?.onSuccess(response.data)
    }
  })
}

export default useNewPlaceMutation
