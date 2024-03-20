import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'
import { elementEndpoint, recordQueryKey, SerializedUser } from './common'

type Variables = { destroyProfile: boolean } | undefined

const deleteUser = (id: number, destroyProfile: boolean) =>
  client
    .delete<never, AxiosResponse<SerializedUser>>(
      elementEndpoint(id) + `?destroyProfile=${destroyProfile}`
    )
    .then(response => response.data)

export const useBatchDeleteUsersMutation = () => {
  const queryClient = useQueryClient()
  const mutationFn = (ids: number[]) => Promise.all(ids.map(id => deleteUser(id, true)))

  return useMutation<SerializedUser[], AxiosError<Record<string, string[]>>, number[]>({
    mutationFn,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'active' })
    }
  })
}

const useDeleteUserMutation = (id: number) => {
  const queryClient = useQueryClient()
  const mutationFn = (variables: Variables) =>
    deleteUser(id, variables?.destroyProfile || false)

  return useMutation<SerializedUser, AxiosError<Record<string, string[]>>, Variables>({
    mutationFn,
    async onSuccess() {
      queryClient.removeQueries({ queryKey: recordQueryKey(id) })
      await queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'active' })
    }
  })
}

export default useDeleteUserMutation
