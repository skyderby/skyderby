import { useMutation, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { standingsQuery } from 'api/speedSkydivingCompetitions/standings'
import { collectionEndpoint, categorySchema, queryKey, Category } from './common'

type Variables = {
  name: string
}

const createCategory = (eventId: number, category: Variables) =>
  client
    .post<{ category: Variables }>(collectionEndpoint(eventId), { category })
    .then(response => categorySchema.parse(response.data))

const useCreateCategoryMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (category: Variables) => createCategory(eventId, category)

  return useMutation<Category, AxiosError<Record<string, string[]>>, Variables>({
    mutationFn,
    async onSuccess(category) {
      const data = queryClient.getQueryData<Category[]>(queryKey(eventId)) ?? []

      queryClient.setQueryData(queryKey(eventId), [...data, category])
      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useCreateCategoryMutation
