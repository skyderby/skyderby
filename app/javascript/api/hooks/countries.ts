import {
  useQuery,
  QueryClient,
  UseQueryResult,
  UseQueryOptions,
  QueryFunction
} from 'react-query'
import axios from 'axios'
import { loadIds, urlWithParams } from 'api/helpers'

export type CountryRecord = {
  id: number
  name: string
  code: string
}

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

type RecordQueryKey = [string, number | undefined]
type IndexQueryKey = [string, IndexParams]

const endpoint = '/api/v1/countries'

const getCountry = (id: number): Promise<CountryRecord> =>
  axios.get(`${endpoint}/${id}`).then(response => response.data)

const getCountries = (params: IndexParams): Promise<CountriesIndex> =>
  axios.get(urlWithParams(endpoint, params)).then(response => response.data)

const getCountriesById = (ids: number[]) => loadIds<CountriesIndex>(endpoint, ids)

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
  cacheTime: Infinity,
  staleTime: Infinity
}

export const cacheCountries = (
  countries: CountryRecord[],
  queryClient: QueryClient
): void =>
  countries?.forEach(country =>
    queryClient.setQueryData(recordQueryKey(country.id), country)
  )

export const preloadCountries = async (
  ids: number[],
  queryClient: QueryClient
): Promise<CountryRecord[]> => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(recordQueryKey(id)))

  const { items: countries } = await getCountriesById(missingIds)
  cacheCountries(countries, queryClient)

  return countries
}

export const recordQueryKey = (id: number | undefined): RecordQueryKey => [
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
  id: number | undefined
): UseQueryOptions<CountryRecord, Error, CountryRecord, RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn: queryCountry,
  enabled: Boolean(id),
  ...cacheOptions
})

export const useCountryQuery = (
  id: number | undefined,
  options: UseQueryOptions<CountryRecord, Error, CountryRecord, RecordQueryKey> = {}
): UseQueryResult<CountryRecord> =>
  useQuery({
    ...countryQuery(id),
    ...options
  })
