import { useMutation, UseMutationResult } from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import { User, ServerErrors } from './common'

interface MutationOptions {
  onSuccess?: () => unknown
}

export interface SignUpForm {
  email: string
  password: string
  passwordConfirmation: string
  profileAttributes: {
    name: string
  }
}

export type SignUpMutation = UseMutationResult<User, AxiosError<ServerErrors>, SignUpForm>

const signUp = async (user: SignUpForm): Promise<User> => {
  const { data } = await client.post<{ user: SignUpForm }, AxiosResponse<User>>(
    '/api/users',
    { user }
  )

  return data
}

const useSignUpMutation = (options: MutationOptions = {}): SignUpMutation => {
  return useMutation({
    mutationFn: signUp,
    onSuccess() {
      options?.onSuccess?.()
    }
  })
}

export default useSignUpMutation
