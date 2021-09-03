import {
  QueryClient,
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import axios from 'axios'
import { loadIds, EmptyResponse } from 'api/helpers'

export type ManufacturerRecord = {
  id: number
  name: string
  code: string
}

type ManufacturersIndex = {
  items: ManufacturerRecord[]
  currentPage: number
  totalPages: number
}

export type RecordQueryKey = ['manufacturers', number | undefined]

const endpoint = '/api/v1/manufacturers'

const getManufacturer = (id: number): Promise<ManufacturerRecord> =>
  axios.get(`${endpoint}/${id}`).then(response => response.data)

const getManufacturersById = (
  ids: number[]
): Promise<ManufacturersIndex | EmptyResponse> =>
  loadIds<ManufacturersIndex>(endpoint, ids)

const queryFn: QueryFunction<ManufacturerRecord, RecordQueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected manufacturer id to be a number, received ${typeof id}`)
  }

  return getManufacturer(id)
}

const recordQueryKey = (id: number | undefined): RecordQueryKey => ['manufacturers', id]

export const cacheManufacturers = (
  manufacturers: ManufacturerRecord[],
  queryClient: QueryClient
): void =>
  manufacturers.forEach(manufacturer =>
    queryClient.setQueryData(recordQueryKey(manufacturer.id), manufacturer)
  )

export const preloadManufacturers = async (
  ids: number[],
  queryClient: QueryClient
): Promise<ManufacturerRecord[]> => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(recordQueryKey(id)))

  if (missingIds.length === 0) return []

  const { items: manufacturers } = await getManufacturersById(missingIds)
  cacheManufacturers(manufacturers, queryClient)

  return manufacturers
}

type QueryOptions = UseQueryOptions<
  ManufacturerRecord,
  Error,
  ManufacturerRecord,
  RecordQueryKey
>

const manufacturerQuery = (id: number | undefined): QueryOptions => ({
  queryKey: recordQueryKey(id),
  queryFn,
  enabled: Boolean(id),
  cacheTime: 60 * 60 * 1000,
  staleTime: 30 * 60 * 1000
})

export const useManufacturerQuery = (
  id: number | undefined,
  options: QueryOptions = {}
): UseQueryResult<ManufacturerRecord> => useQuery({ ...manufacturerQuery(id), ...options })
