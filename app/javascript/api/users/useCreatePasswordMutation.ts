import client from 'api/client'
import { AxiosError, AxiosResponse } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Variables {
  password: string
  passwordConfirmation: string
  resetPasswordToken: string
}

interface Errors {
  errors: {
    reset_password_token: string[]
    password: string[]
    base: string[]
  }
}

const createPassword = async (variables: Variables) => {
  const { data } = await client.put<{ user: Variables }, AxiosResponse>(
    '/api/users/passwords',
    { user: variables }
  )

  return data
}

const useCreatePasswordMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<AxiosResponse, AxiosError<Errors>, Variables>({
    mutationFn: createPassword,
    onSuccess() {
      queryClient.resetQueries()
    }
  })
}

export default useCreatePasswordMutation
