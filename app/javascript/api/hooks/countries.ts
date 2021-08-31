import {
  useQueries,
  useQuery,
  QueryClient,
  UseQueryResult,
  UseQueryOptions,
  QueryFunction
} from 'react-query'
import axios from 'axios'
import { loadIds, urlWithParams } from 'api/helpers'

export type CountryType = {
  id?: number
  name?: string
  code?: string
}

type CountriesIndexData = {
  items?: CountryType[]
  currentPage?: number
  totalPages?: number
}

type RecordQueryKey = [string, number | undefined]

type IndexParamsType = {
  search?: string
  page?: number
  perPage?: number
}

type IndexQueryKey = [string, IndexParamsType]

const endpoint = '/api/v1/countries'

const getCountry = (id: number): Promise<CountryType> =>
  axios.get(`${endpoint}/${id}`).then(response => response.data)

const getCountries = (params: IndexParamsType): Promise<CountriesIndexData> =>
  axios.get(urlWithParams(endpoint, params)).then(response => response.data)

const getCountriesById = (ids: number[]) => loadIds<CountriesIndexData>(endpoint, ids)

const queryCountry: QueryFunction<CountryType, RecordQueryKey> = ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected country id to be a number, received ${typeof id}`)
  }

  return getCountry(id)
}

const queryCountries: QueryFunction<
  CountriesIndexData,
  [string, IndexParamsType]
> = ctx => {
  const [_key, params] = ctx.queryKey
  return getCountries(params)
}

const recordQueryKey = (id: number | undefined): RecordQueryKey => ['countries', id]
const indexQueryKey = (params: IndexParamsType): IndexQueryKey => ['countries', params]

const cacheOptions = {
  cacheTime: Infinity,
  staleTime: Infinity
}

export const cacheCountries = (
  countries: CountryType[],
  queryClient: QueryClient
): void =>
  countries?.forEach(country =>
    queryClient.setQueryData(recordQueryKey(country.id), country)
  )

export const preloadCountries = async (
  ids: number[],
  queryClient: QueryClient
): Promise<CountryType[]> => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(recordQueryKey(id)))

  const { items: countries } = await getCountriesById(missingIds)
  cacheCountries(countries, queryClient)

  return countries
}

export const countryQuery = (
  id: number | undefined
): UseQueryOptions<CountryType, Error, CountryType, RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn: queryCountry,
  enabled: Boolean(id),
  ...cacheOptions
})

export const countriesQuery = (
  params: IndexParamsType
): UseQueryOptions<CountriesIndexData, Error, CountryType, IndexQueryKey> => ({
  queryKey: indexQueryKey(params),
  queryFn: queryCountries,
  ...cacheOptions
})

export const useCountryQuery = (
  id: number | undefined,
  options: UseQueryOptions = {}
): UseQueryResult<CountryType> =>
  useQuery({
    ...countryQuery(id),
    ...options
  })

export const useCountryQueries = (ids: number[]): UseQueryResult<CountryType>[] =>
  useQueries(
    Array.from(new Set(ids))
      .filter(Boolean)
      .map(id => countryQuery(id))
  )
