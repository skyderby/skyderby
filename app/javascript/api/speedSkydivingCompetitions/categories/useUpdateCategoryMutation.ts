import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { Category, elementEndpoint, queryKey, categorySchema } from './common'

type Variables = {
  name: string
}

const updateCategory = (eventId: number, id: number, category: Variables) =>
  client
    .put<{ category: Variables }>(elementEndpoint(eventId, id), { category })
    .then(response => categorySchema.parse(response.data))

const useUpdateCategoryMutation = (eventId: number, categoryId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (category: Variables) =>
    updateCategory(eventId, categoryId, category)

  return useMutation<Category, AxiosError<Record<string, string[]>>, Variables>({
    mutationFn,
    onSuccess(updatedCategory) {
      const data = queryClient.getQueryData<Category[]>(queryKey(eventId)) ?? []

      queryClient.setQueryData(
        queryKey(eventId),
        data.map(category => (category.id === categoryId ? updatedCategory : category))
      )
    }
  })
}

export default useUpdateCategoryMutation
