import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { standingsQuery } from 'api/speedSkydivingCompetitions/standings'
import { Category, elementEndpoint, queryKey, categorySchema } from './common'

const deleteCategory = (eventId: number, id: number) =>
  client
    .delete<never>(elementEndpoint(eventId, id))
    .then(response => categorySchema.parse(response.data))

const useDeleteCategoryMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteCategory(eventId, id)

  return useMutation<Category, AxiosError<Record<string, string[]>>, void>({
    mutationFn,
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKey(eventId) }),
        queryClient.refetchQueries(standingsQuery(eventId))
      ])
    }
  })
}

export default useDeleteCategoryMutation
