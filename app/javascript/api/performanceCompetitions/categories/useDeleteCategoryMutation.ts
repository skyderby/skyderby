import client from 'api/client'
import { AxiosError } from 'axios'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import { queryKey, categoryUrl, categorySchema, Category } from './common'

const deleteCategory = (eventId: number, id: number) =>
  client
    .delete<never>(categoryUrl(eventId, id))
    .then(response => categorySchema.parse(response.data))

const useDeleteCategoryMutation = (eventId: number, id: number) => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteCategory(eventId, id)

  return useMutation<Category, AxiosError<Record<string, string[]>>>({
    mutationFn,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKey(eventId) })
      queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useDeleteCategoryMutation
