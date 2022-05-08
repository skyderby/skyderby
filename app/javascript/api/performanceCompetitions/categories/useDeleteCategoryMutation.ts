import client from 'api/client'

import { useMutation, UseMutationResult, useQueryClient } from 'react-query'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'
import { queryKey, categoryUrl, SerializedCategory } from './common'
import { AxiosError, AxiosResponse } from 'axios'

const deleteCategory = (eventId: number, id: number) =>
  client.delete<never, AxiosResponse<SerializedCategory>>(categoryUrl(eventId, id))

const useDeleteCategoryMutation = (
  eventId: number,
  id: number
): UseMutationResult<AxiosResponse<SerializedCategory>, AxiosError> => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteCategory(eventId, id)

  return useMutation(mutationFn, {
    onSuccess() {
      queryClient.invalidateQueries(queryKey(eventId))
      queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useDeleteCategoryMutation
