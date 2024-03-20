import { useMutation, useQueryClient } from '@tanstack/react-query'

import client, { AxiosError } from 'api/client'
import {
  categoryUrl,
  queryKey,
  categorySchema,
  Category,
  CategoryVariables
} from './common'

const updateCategory = (eventId: number, id: number, category: CategoryVariables) =>
  client
    .put<{ category: CategoryVariables }>(categoryUrl(eventId, id), { category })
    .then(response => categorySchema.parse(response.data))

const useEditCategoryMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (category: CategoryVariables) =>
    updateCategory(eventId, id, category)

  return useMutation<Category, AxiosError<Record<string, string[]>>, CategoryVariables>({
    mutationFn,
    onSuccess(updatedCategory) {
      const data = queryClient.getQueryData<Category[]>(queryKey(eventId)) ?? []

      queryClient.setQueryData(
        queryKey(eventId),
        data.map(category => (category.id === id ? updatedCategory : category))
      )
    }
  })
}

export default useEditCategoryMutation
