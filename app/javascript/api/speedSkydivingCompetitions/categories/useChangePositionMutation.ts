import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from 'api/client'
import { elementEndpoint, queryKey } from './common'
import { AxiosError, AxiosResponse } from 'axios'

type Variables = {
  direction: 'up' | 'down'
}

const categoryPositionUrl = (eventId: number, id: number) =>
  `${elementEndpoint(eventId, id)}/position`

const updateCategoryPosition = (
  eventId: number,
  id: number,
  direction: Variables['direction']
) =>
  client.put<Variables, AxiosResponse<void>>(categoryPositionUrl(eventId, id), {
    direction
  })

const useChangePositionMutation = (eventId: number, categoryId: number) => {
  const queryClient = useQueryClient()
  const mutationFn = (variables: Variables) =>
    updateCategoryPosition(eventId, categoryId, variables.direction)

  return useMutation<
    AxiosResponse<void>,
    AxiosError<Record<string, string[]>>,
    Variables
  >({
    mutationFn,
    onSuccess(_response) {
      return queryClient.invalidateQueries({ queryKey: queryKey(eventId) })
    }
  })
}

export default useChangePositionMutation
