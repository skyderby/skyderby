import {
  useQuery,
  QueryClient,
  UseQueryResult,
  UseQueryOptions,
  QueryFunction
} from '@tanstack/react-query'
import { z } from 'zod'

import queryClient from 'components/queryClient'
import client from 'api/client'
import { loadIds, urlWithParams } from 'api/helpers'

export const countrySchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string()
})

export type CountryRecord = z.infer<typeof countrySchema>

type CountriesIndex = {
  items: CountryRecord[]
  currentPage: number
  totalPages: number
}

type IndexParams = {
  search?: string
  page?: number
  perPage?: number
}

type RecordQueryKey = ['countries', number | null | undefined]
type IndexQueryKey = [string, IndexParams]

const endpoint = '/api/v1/countries'

const getCountry = (id: number): Promise<CountryRecord> =>
  client.get(`${endpoint}/${id}`).then(response => response.data)

const getCountries = (params: IndexParams): Promise<CountriesIndex> =>
  client.get(urlWithParams(endpoint, params)).then(response => response.data)

const getCountriesById = (ids: number[]) => loadIds<CountryRecord>(endpoint, ids)

const queryCountry: QueryFunction<CountryRecord, RecordQueryKey> = ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected country id to be a number, received ${typeof id}`)
  }

  return getCountry(id)
}

const queryCountries: QueryFunction<CountriesIndex, [string, IndexParams]> = ctx => {
  const [_key, params] = ctx.queryKey
  return getCountries(params)
}

const indexQueryKey = (params: IndexParams): IndexQueryKey => ['countries', params]

const cacheOptions = {
  gcTime: Infinity,
  staleTime: Infinity
}

export const cacheCountries = (countries: CountryRecord[]): void =>
  countries?.forEach(country =>
    queryClient.setQueryData<CountryRecord>(recordQueryKey(country.id), country)
  )

export const preloadCountries = async (
  ids: number[],
  queryClient: QueryClient
): Promise<CountryRecord[]> => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(recordQueryKey(id)))

  const { items: countries } = await getCountriesById(missingIds)
  cacheCountries(countries)

  return countries
}

export const recordQueryKey = (id: number | null | undefined): RecordQueryKey => [
  'countries',
  id
]

export const countriesQuery = (
  params: IndexParams
): UseQueryOptions<CountriesIndex, Error, CountryRecord, IndexQueryKey> => ({
  queryKey: indexQueryKey(params),
  queryFn: queryCountries,
  ...cacheOptions
})

export const countryQuery = (
  id: number | null | undefined
): UseQueryOptions<CountryRecord, Error, CountryRecord, RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn: queryCountry,
  enabled: Boolean(id),
  ...cacheOptions
})

export const useCountryQuery = (
  id: number | null | undefined,
  options: Omit<
    UseQueryOptions<CountryRecord, Error, CountryRecord, RecordQueryKey>,
    'queryKey' | 'queryFn'
  > = {}
): UseQueryResult<CountryRecord> =>
  useQuery({
    ...countryQuery(id),
    ...options
  })
