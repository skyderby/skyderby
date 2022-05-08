import { useMutation, UseMutationResult, useQueryClient } from 'react-query'

import client, { AxiosResponse, AxiosError } from 'api/client'
import { categoryUrl, queryKey } from './common'

type Direction = 'up' | 'down'

const categoryPositionUrl = (eventId: number, id: number) =>
  `${categoryUrl(eventId, id)}/position`

const updateCategoryPosition = (eventId: number, id: number, direction: Direction) =>
  client.put<{ direction: Direction }, AxiosResponse<void>>(
    categoryPositionUrl(eventId, id),
    { direction }
  )

const useChangePositionMutation = (
  eventId: number,
  id: number
): UseMutationResult<AxiosResponse<void>, AxiosError, Direction> => {
  const queryClient = useQueryClient()

  const mutationFn = (direction: Direction) =>
    updateCategoryPosition(eventId, id, direction)
  return useMutation(mutationFn, {
    onSuccess() {
      return queryClient.invalidateQueries(queryKey(eventId))
    }
  })
}

export default useChangePositionMutation
