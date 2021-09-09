import axios, { AxiosError } from 'axios'
import {
  useQuery,
  useQueryClient,
  useMutation,
  UseQueryResult,
  UseMutationResult
} from 'react-query'

import { getCSRFToken, setCSRFToken } from 'utils/csrfToken'

export type GuestUser = {
  authorized: false
  permissions: {
    canCreatePlace: false
  }
}

export type AuthorizedUser = {
  authorized: boolean
  userId: number
  profileId: number
  email: string
  name: string
  countryId: number
  photo: {
    original: string
    medium: string
    thumb: string
  }
}

export type CurrentUser = GuestUser | AuthorizedUser

export type LoginData = {
  email: string
  password: string
}

const getCurrentUser = () =>
  fetch('/api/v1/current_user', {
    method: 'GET',
    credentials: 'include',
    mode: 'no-cors'
  }).then(response => response.json())

const login = async (user: LoginData): Promise<AuthorizedUser> => {
  const { data, headers } = await axios.post(
    '/api/users/sign_in',
    { user },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken()
      }
    }
  )

  setCSRFToken(headers['new-csrf-token'])

  return data
}

const logout = async (): Promise<void> => {
  const { headers } = await axios.delete('/api/users/sign_out', {
    headers: {
      Accept: 'application/json',
      'X-CSRF-Token': getCSRFToken()
    }
  })

  setCSRFToken(headers['new-csrf-token'])
}

const queryKey = ['currentUser']

export const useCurrentUserQuery = (): UseQueryResult<CurrentUser> =>
  useQuery({ queryKey, queryFn: getCurrentUser })

export const useLoginMutation = (): UseMutationResult<
  AuthorizedUser,
  AxiosError,
  LoginData
> => {
  const queryClient = useQueryClient()

  return useMutation(login, {
    onSuccess(data) {
      queryClient.clear()
      queryClient.setQueryData(queryKey, data)
    }
  })
}

export const useLogoutMutation = (): UseMutationResult<void> => {
  const queryClient = useQueryClient()

  return useMutation(logout, {
    onSuccess() {
      queryClient.clear()
    }
  })
}
