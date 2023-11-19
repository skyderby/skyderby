import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'

import queryClient from 'components/queryClient'
import { cacheManufacturers, preloadManufacturers } from 'api/manufacturer'
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

const queryFn: QueryFunction<SuitRecord, RecordQueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected suit id to be a number, received ${typeof id}`)
  }

  const data = await getSuit(id)

  await preloadManufacturers([data.makeId])

  return data
}

const allSuitsQueryFn: QueryFunction<SuitRecord[], IndexQueryKey> = async ctx => {
  const [_key, params] = ctx.queryKey
  const chunks = await getAllSuits(params)
  const suits = chunks.map(chunk => chunk.items).flat()
  const manufacturers = chunks.map(chunk => chunk.relations.manufacturers).flat()

  cacheSuits(suits)
  cacheManufacturers(manufacturers)

  return suits
}

const suitsQueryFn: QueryFunction<SuitsIndex, IndexQueryKey> = async ctx => {
  const [_key, params] = ctx.queryKey
  const data = await getSuits(params)

  const suits = data.items
  cacheSuits(suits)
  cacheManufacturers(data.relations?.manufacturers)

  return data
}

export const cacheSuits = (suits: SuitRecord[]): void =>
  suits
    .filter(suit => !queryClient.getQueryData(recordQueryKey(suit.id)))
    .forEach(suit => queryClient.setQueryData<SuitRecord>(recordQueryKey(suit.id), suit))

export const preloadSuits = async (ids: number[]): Promise<SuitRecord[]> => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(recordQueryKey(id)))

  if (missingIds.length === 0) return []

  const { items: suits } = await getSuitsById(missingIds)
  cacheSuits(suits)

  await preloadManufacturers(suits.map(suit => suit.makeId))

  return suits
}

const cacheOptions = {
  gcTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
}

type QueryOptions = UseQueryOptions<SuitRecord, Error, SuitRecord, RecordQueryKey>

const suitQuery = (id: number | null | undefined): QueryOptions => ({
  queryKey: recordQueryKey(id),
  queryFn,
  enabled: !!id,
  gcTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
})

export const useSuitQuery = (
  id: number | null | undefined,
  options: Omit<QueryOptions, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<SuitRecord> => useQuery({ ...suitQuery(id), ...options })

export const suitsQuery = (
  params: IndexParams = {}
): UseQueryOptions<SuitsIndex, Error, SuitsIndex, IndexQueryKey> => ({
  queryKey: indexQueryKey(params),
  queryFn: suitsQueryFn,
  ...cacheOptions
})

export const useAllSuitsQuery = (
  params: IndexParams = {}
): UseQueryResult<SuitRecord[]> =>
  useQuery({
    queryKey: indexQueryKey(params),
    queryFn: allSuitsQueryFn,
    ...cacheOptions
  })
