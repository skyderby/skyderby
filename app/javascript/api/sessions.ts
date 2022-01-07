import {
  useQuery,
  useQueryClient,
  useMutation,
  UseQueryResult,
  UseMutationResult
} from 'react-query'

import client, { AxiosError, AxiosResponse } from 'api/client'

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
  const { data } = await client.post<{ user: LoginData }, AxiosResponse<AuthorizedUser>>(
    '/api/users/sign_in',
    { user }
  )

  return data
}

const logout = () => client.delete<void, AxiosResponse<void>>('/api/users/sign_out')

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

export const useLogoutMutation = (): UseMutationResult<AxiosResponse<void>> => {
  const queryClient = useQueryClient()

  return useMutation(logout, {
    onSuccess() {
      return queryClient.resetQueries()
    }
  })
}
