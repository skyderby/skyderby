import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
  UseMutationResult
} from '@tanstack/react-query'
import { z } from 'zod'

import client, { AxiosError, AxiosResponse } from 'api/client'

const guestUserSchema = z.object({
  authorized: z.literal(false),
  permissions: z.object({
    canAccessAdminPanel: z.literal(false),
    canCreatePlace: z.literal(false),
    canManageUsers: z.literal(false)
  })
})

const authorizedUserSchema = z.object({
  authorized: z.literal(true),
  userId: z.number(),
  profileId: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  countryId: z.number().nullable(),
  photo: z.object({
    original: z.string(),
    medium: z.string(),
    thumb: z.string()
  }),
  permissions: z.object({
    canAccessAdminPanel: z.boolean(),
    canCreatePlace: z.boolean(),
    canManageUsers: z.boolean()
  })
})

const currentUserSchema = authorizedUserSchema.or(guestUserSchema)

export type GuestUser = z.infer<typeof guestUserSchema>
export type AuthorizedUser = z.infer<typeof authorizedUserSchema>
export type CurrentUser = z.infer<typeof currentUserSchema>

export type LoginData = {
  email: string
  password: string
}

const getCurrentUser = () =>
  fetch('/api/v1/current_user', {
    method: 'GET',
    credentials: 'include',
    mode: 'no-cors'
  })
    .then(response => response.json())
    .then(data => currentUserSchema.parse(data))

const login = async (user: LoginData) => {
  const { data } = await client.post<{ user: LoginData }, AxiosResponse<AuthorizedUser>>(
    '/api/users/sign_in',
    { user }
  )

  return data
}

const logout = () => client.delete<void, AxiosResponse<void>>('/api/users/sign_out')

const queryKey = ['currentUser']

export const useCurrentUserQuery = () =>
  useSuspenseQuery<CurrentUser>({ queryKey, queryFn: getCurrentUser })

export const useLoginMutation = (): UseMutationResult<
  AuthorizedUser,
  AxiosError<Record<string, string[]>>,
  LoginData
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess(data) {
      queryClient.setQueryData(queryKey, data)
      queryClient.resetQueries()
    }
  })
}

export const useLogoutMutation = (): UseMutationResult<AxiosResponse<void>> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess() {
      return queryClient.resetQueries()
    }
  })
}
