import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'

import client, { AxiosError, AxiosResponse } from 'api/client'
import {
  categoryUrl,
  queryKey,
  Category,
  SerializedCategory,
  CategoryVariables,
  deserialize
} from './common'

const updateCategory = (eventId: number, id: number, category: CategoryVariables) =>
  client.put<{ category: CategoryVariables }, AxiosResponse<SerializedCategory>>(
    categoryUrl(eventId, id),
    { category }
  )

const useEditCategoryMutation = (
  eventId: number,
  id: number
): UseMutationResult<
  AxiosResponse<SerializedCategory>,
  AxiosError,
  CategoryVariables
> => {
  const queryClient = useQueryClient()

  const mutationFn = (category: CategoryVariables) =>
    updateCategory(eventId, id, category)

  return useMutation({
    mutationFn,
    onSuccess(response) {
      const data: Category[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const updatedCategory = deserialize(response.data)

      queryClient.setQueryData(
        queryKey(eventId),
        data.map(category => (category.id === id ? updatedCategory : category))
      )
    }
  })
}

export default useEditCategoryMutation
