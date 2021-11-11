import { useMutation, UseMutationResult } from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'

import { getCSRFToken, setCSRFToken } from 'utils/csrfToken'

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

export interface User {
  id: number
  email: string
  provider: 'facebook' | null
  uid: string | null
}

export interface ServerErrors {
  errors: Record<string, string[]>
}

export type SignUpMutation = UseMutationResult<User, AxiosError<ServerErrors>, SignUpForm>

const signUp = async (user: SignUpForm): Promise<User> => {
  const { data, headers } = await axios.post<{ user: SignUpForm }, AxiosResponse<User>>(
    '/api/users',
    { user },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': String(getCSRFToken())
      }
    }
  )

  setCSRFToken(headers['new-csrf-token'])

  return data
}

export const useSignUpMutation = (options: MutationOptions = {}): SignUpMutation => {
  return useMutation(signUp, {
    onSuccess() {
      options?.onSuccess?.()
    }
  })
}
