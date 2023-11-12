import { QueryFunction, useQuery, UseQueryResult } from '@tanstack/react-query'
import { parseISO } from 'date-fns'
import client, { AxiosResponse } from 'api/client'
import { User } from './common'

type IndexQueryKey = ['users', IndexParams]

export interface IndexParams {
  page?: number
  perPage?: number
  searchTerm?: string
  sortBy?: 'id asc' | 'id desc' | 'name asc' | 'name desc'
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

interface IndexResponse<T = UserIndexRecord> {
  items: T[]
  currentPage: number
  totalPages: number
}

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
  return client
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

const useUsersQuery = (params: IndexParams = {}): UseQueryResult<IndexResponse> =>
  useQuery({
    queryFn: queryUsers,
    queryKey: ['users', params]
  })

export default useUsersQuery
