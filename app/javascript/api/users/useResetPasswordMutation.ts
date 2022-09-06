import { useMutation } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'
import client from 'api/client'

interface Variables {
  email: string
}

interface Errors {
  errors: {
    email: string[]
    base: string[]
  }
}

const resetPassword = async (variables: Variables) => {
  const { data } = await client.post<{ user: Variables }, AxiosResponse>(
    '/api/users/passwords',
    { user: variables }
  )

  return data
}

const useResetPasswordMutation = () =>
  useMutation<AxiosResponse, AxiosError<Errors>, Variables>(resetPassword)

export default useResetPasswordMutation
