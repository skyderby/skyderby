import { useMutation, useQueryClient } from 'react-query'
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

const useDeleteUserMutation = (id: number) => {
  const queryClient = useQueryClient()
  const mutateFn = (variables: Variables) =>
    deleteUser(id, variables?.destroyProfile || false)

  return useMutation<SerializedUser, AxiosError<Record<string, string[]>>, Variables>(
    mutateFn,
    {
      async onSuccess() {
        queryClient.removeQueries(recordQueryKey(id))
        await queryClient.invalidateQueries('users')
      }
    }
  )
}

export default useDeleteUserMutation
