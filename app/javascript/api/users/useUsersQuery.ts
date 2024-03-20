import { QueryFunctionContext, useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import client from 'api/client'

type QueryKey = ['users', IndexParams]

export interface IndexParams {
  page?: number
  perPage?: number
  searchTerm?: string
  sortBy?: 'id asc' | 'id desc' | 'name asc' | 'name desc'
}

const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  signInCount: z.number(),
  oauth: z.boolean(),
  confirmed: z.boolean(),
  createdAt: z.coerce.date()
})

const indexResponseSchema = z.object({
  items: z.array(userSchema),
  currentPage: z.number(),
  totalPages: z.number()
})

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
  return client.get<never>(url).then(response => indexResponseSchema.parse(response.data))
}

const queryFn = async (ctx: QueryFunctionContext<QueryKey>) => {
  const [_key, params] = ctx.queryKey
  return getUsers(params)
}

const useUsersQuery = (params: IndexParams = {}) =>
  useSuspenseQuery({
    queryFn,
    queryKey: ['users', params]
  })

export default useUsersQuery
