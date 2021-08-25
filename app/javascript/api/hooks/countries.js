import { useQueries, useQuery } from 'react-query'
import axios from 'axios'
import { loadIds, urlWithParams } from 'api/helpers'

const endpoint = '/api/v1/countries'

const getCountry = id => axios.get(`${endpoint}/${id}`)
const getCountries = params => axios.get(urlWithParams(endpoint, params))
const getCountriesById = ids => loadIds(endpoint, ids)

const queryCountry = ctx => {
  const [_key, id] = ctx.queryKey
  return getCountry(id).then(response => response.data)
}

const queryCountries = ctx => {
  const [_key, params] = ctx.queryKey
  return getCountries(params).then(response => response.data)
}

const getQueryKey = id => ['countries', id]

const cacheOptions = {
  cacheTime: Infinity,
  staleTime: Infinity
}

export const cacheCountries = (countries, queryClient) =>
  countries?.forEach(country =>
    queryClient.setQueryData(getQueryKey(country.id), country)
  )

export const preloadCountries = async (ids, queryClient) => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(getQueryKey(id)))

  const { items: countries } = await getCountriesById(missingIds)
  cacheCountries(countries, queryClient)

  return countries
}

export const countryQuery = id => ({
  queryKey: getQueryKey(id),
  queryFn: queryCountry,
  enabled: !!id,
  ...cacheOptions
})

export const useCountryQuery = (id, options = {}) =>
  useQuery({ ...countryQuery(id), ...options })

export const useCountryQueries = ids =>
  useQueries(
    Array.from(new Set(ids))
      .filter(Boolean)
      .map(id => countryQuery(id))
  )

export const countriesQuery = params => ({
  queryKey: ['countries', params].filter(Boolean),
  queryFn: queryCountries,
  ...cacheOptions
})
