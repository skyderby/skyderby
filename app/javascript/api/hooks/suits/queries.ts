import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'

import { cacheManufacturers, preloadManufacturers } from 'api/hooks/manufacturer'
import { getAllSuits, getSuit, getSuits, getSuitsById } from './requests'
import {
  IndexParams,
  IndexQueryKey,
  RecordQueryKey,
  SuitsIndex,
  SuitRecord
} from './types'

const indexQueryKey = (params: IndexParams): IndexQueryKey => ['suits', params]
const recordQueryKey = (id: number | null | undefined): RecordQueryKey => ['suits', id]

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<SuitRecord, RecordQueryKey> => async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected suit id to be a number, received ${typeof id}`)
  }

  const data = await getSuit(id)

  await preloadManufacturers([data.makeId], queryClient)

  return data
}

const buildAllSuitsQueryFn = (
  queryClient: QueryClient
): QueryFunction<SuitRecord[], IndexQueryKey> => async ctx => {
  const [_key, params] = ctx.queryKey
  const chunks = await getAllSuits(params)
  const suits = chunks.map(chunk => chunk.items).flat()
  const manufacturers = chunks.map(chunk => chunk.relations.manufacturers).flat()

  cacheSuits(suits, queryClient)
  cacheManufacturers(manufacturers, queryClient)

  return suits
}

const buildSuitsQueryFn = (
  queryClient: QueryClient
): QueryFunction<SuitsIndex, IndexQueryKey> => async ctx => {
  const [_key, params] = ctx.queryKey
  const data = await getSuits(params)

  const suits = data.items
  cacheSuits(suits, queryClient)
  cacheManufacturers(data.relations?.manufacturers, queryClient)

  return data
}

export const cacheSuits = (suits: SuitRecord[], queryClient: QueryClient): void =>
  suits
    .filter(suit => !queryClient.getQueryData(recordQueryKey(suit.id)))
    .forEach(suit => queryClient.setQueryData(recordQueryKey(suit.id), suit))

export const preloadSuits = async (
  ids: number[],
  queryClient: QueryClient
): Promise<SuitRecord[]> => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(recordQueryKey(id)))

  if (missingIds.length === 0) return []

  const { items: suits } = await getSuitsById(missingIds)
  cacheSuits(suits, queryClient)

  await preloadManufacturers(
    suits.map(place => place.makeId),
    queryClient
  )

  return suits
}

const cacheOptions = {
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
}

type QueryOptions = UseQueryOptions<SuitRecord, Error, SuitRecord, RecordQueryKey>

const suitQuery = (
  id: number | null | undefined,
  queryClient: QueryClient
): QueryOptions => ({
  queryKey: recordQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: !!id,
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
})

export const useSuitQuery = (
  id: number | null | undefined,
  options: QueryOptions = {}
): UseQueryResult<SuitRecord> => {
  const queryClient = useQueryClient()
  return useQuery({ ...suitQuery(id, queryClient), ...options })
}

export const suitsQuery = (
  params: IndexParams = {},
  queryClient: QueryClient
): UseQueryOptions<SuitsIndex, Error, SuitsIndex, IndexQueryKey> => ({
  queryKey: indexQueryKey(params),
  queryFn: buildSuitsQueryFn(queryClient),
  ...cacheOptions
})

export const useAllSuitsQuery = (
  params: IndexParams = {}
): UseQueryResult<SuitRecord[]> => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: indexQueryKey(params),
    queryFn: buildAllSuitsQueryFn(queryClient),
    ...cacheOptions
  })
}
