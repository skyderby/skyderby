import client from 'api/client'
import { AxiosResponse, AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'

interface Variables {
  email: string
}

interface Errors {
  errors: {
    email: string[]
    base: string[]
  }
}

const resendConfirmation = async (variables: Variables) => {
  const { data } = await client.post<{ user: Variables }, AxiosResponse>(
    '/api/users/confirmations',
    { user: variables }
  )

  return data
}

const useResendConfirmationMutation = () =>
  useMutation<AxiosResponse, AxiosError<Errors>, Variables>({
    mutationFn: resendConfirmation
  })

export default useResendConfirmationMutation
