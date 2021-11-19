import axios, { AxiosError, AxiosResponse } from 'axios'
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
    canManageUsers: false
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
  permissions: {
    canCreatePlace: boolean
    canManageUsers: boolean
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

const login = async (user: LoginData) => {
  const { data, headers } = await axios.post<
    { user: LoginData },
    AxiosResponse<AuthorizedUser>
  >(
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
  AxiosError<{ error: string }>,
  LoginData
> => {
  const queryClient = useQueryClient()

  return useMutation(login, {
    onSuccess(data) {
      queryClient.setQueryData(queryKey, data)
      return queryClient.resetQueries()
    }
  })
}

export const useLogoutMutation = (): UseMutationResult<void> => {
  const queryClient = useQueryClient()

  return useMutation(logout, {
    onSuccess() {
      return queryClient.resetQueries()
    }
  })
}
