import {
  QueryFunction,
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult
} from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { parseISO } from 'date-fns'

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

export interface UserIndexRecord extends User {
  name?: string
  confirmed: boolean
  createdAt: Date
}

type SerializedUserIndexRecord = {
  [K in keyof UserIndexRecord]: UserIndexRecord[K] extends Date
    ? string
    : UserIndexRecord[K]
}

export interface IndexParams {
  page?: number
  perPage?: number
  searchTerm?: string
  sortBy?: 'id asc' | 'id desc' | 'name asc' | 'name desc'
}

interface IndexResponse<T = UserIndexRecord> {
  items: T[]
  currentPage: number
  totalPages: number
}

export interface ServerErrors {
  errors: Record<string, string[]>
}

export type SignUpMutation = UseMutationResult<User, AxiosError<ServerErrors>, SignUpForm>

type IndexQueryKey = ['users', IndexParams]

const endpoint = '/api/v1/users'

export const mapParamsToUrl = (params: IndexParams): string => {
  const urlParams = new URLSearchParams()
  if (Number(params.page) > 1) urlParams.set('page', String(params.page))
  if (params.searchTerm) urlParams.set('searchTerm', params.searchTerm)

  const stringParams = urlParams.toString()
  return stringParams ? '?' + stringParams : ''
}

const getUsers = (params: IndexParams) => {
  const url = `${endpoint}${mapParamsToUrl(params)}`
  return axios
    .get<never, AxiosResponse<IndexResponse<SerializedUserIndexRecord>>>(url)
    .then(response => response.data)
}

const queryUsers: QueryFunction<IndexResponse, IndexQueryKey> = async ctx => {
  const [_key, params] = ctx.queryKey
  const response = await getUsers(params)

  return {
    ...response,
    items: response.items.map(
      (record: SerializedUserIndexRecord): UserIndexRecord => ({
        ...record,
        createdAt: parseISO(record.createdAt)
      })
    )
  }
}

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

export const useUsersQuery = (params: IndexParams = {}): UseQueryResult<IndexResponse> =>
  useQuery({
    queryFn: queryUsers,
    queryKey: ['users', params]
  })
