import { useMutation, useQueryClient } from '@tanstack/react-query'

import client from 'api/client'
import { endpoint, queryKey, categorySchema, CategoryVariables, Category } from './common'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import { AxiosError } from 'axios'

const createCategory = (eventId: number, category: CategoryVariables) =>
  client
    .post<{ category: CategoryVariables }>(endpoint(eventId), { category })
    .then(response => categorySchema.parse(response.data))

const useCreateCategoryMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (values: CategoryVariables) => createCategory(eventId, values)

  return useMutation<Category, AxiosError<Record<string, string[]>>, CategoryVariables>({
    mutationFn,
    async onSuccess(category) {
      const data = queryClient.getQueryData<Category[]>(queryKey(eventId)) ?? []

      queryClient.setQueryData(queryKey(eventId), [...data, category])

      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useCreateCategoryMutation
