import { useMutation, useQueryClient } from 'react-query'

import client, { AxiosResponse } from 'api/client'
import {
  endpoint,
  queryKey,
  CategoryVariables,
  Category,
  SerializedCategory,
  deserialize
} from './common'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import { AxiosError } from 'axios'

const createCategory = (eventId: number, category: CategoryVariables) =>
  client.post<{ category: CategoryVariables }, AxiosResponse<SerializedCategory>>(
    endpoint(eventId),
    { category }
  )

const useCreateCategoryMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (values: CategoryVariables) => createCategory(eventId, values)

  return useMutation<
    AxiosResponse<SerializedCategory>,
    AxiosError<Record<string, string[]>>,
    CategoryVariables
  >(mutationFn, {
    async onSuccess(response) {
      const data: Category[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const category = deserialize(response.data)

      queryClient.setQueryData(queryKey(eventId), [...data, category])

      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useCreateCategoryMutation
