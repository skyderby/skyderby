import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'

import { preloadManufacturers } from 'api/hooks/manufacturer'
import { getAllSuits, getSuit, getSuits, getSuitsById } from './requests'
import {
  AllSuitsQueryKey,
  IndexParams,
  IndexQueryKey,
  RecordQueryKey,
  SuitsIndex,
  SuitRecord
} from './types'

const allSuitsQueryKey: AllSuitsQueryKey = ['suits', 'all']
const indexQueryKey = (params: IndexParams): IndexQueryKey => ['suits', params]
const recordQueryKey = (id: number | undefined): RecordQueryKey => ['suits', id]

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
): QueryFunction<SuitRecord[], AllSuitsQueryKey> => async () => {
  const chunks = await getAllSuits()
  const suits = chunks.map(chunk => chunk.items).flat()
  const makeIds = suits.map(suit => suit.makeId)
  await preloadManufacturers(makeIds, queryClient)

  cacheSuits(suits, queryClient)

  return suits
}

const buildSuitsQueryFn = (
  queryClient: QueryClient
): QueryFunction<SuitsIndex, IndexQueryKey> => async ctx => {
  const [_key, params] = ctx.queryKey
  const data = await getSuits(params)

  const suits = data.items

  const makeIds = suits.map(suit => suit.makeId)
  await preloadManufacturers(makeIds, queryClient)

  cacheSuits(suits, queryClient)

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

const suitQuery = (id: number | undefined, queryClient: QueryClient): QueryOptions => ({
  queryKey: recordQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: !!id,
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
})

export const useSuitQuery = (
  id: number | undefined,
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

export const useAllSuitsQuery = (): UseQueryResult<SuitRecord[]> => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: allSuitsQueryKey,
    queryFn: buildAllSuitsQueryFn(queryClient),
    ...cacheOptions
  })
}
