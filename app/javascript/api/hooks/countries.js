import { useQueries, useQuery } from 'react-query'
import axios from 'axios'
import { loadIds } from 'api/helpers'

const endpoint = '/api/v1/countries'

const getCountry = id => axios.get(`${endpoint}/${id}`)

const getCountriesById = ids => loadIds(endpoint, ids)

const queryFn = async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getCountry(id)

  return data
}

export const getQueryKey = id => ['countries', id]

export const preloadCountries = async (ids, queryClient) => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => !queryClient.getQueryData(getQueryKey(id)))

  const { items: countries } = await getCountriesById(missingIds)
  countries?.forEach(country =>
    queryClient.setQueryData(getQueryKey(country.id), country)
  )

  return countries
}

export const getQueryOptions = id => ({
  queryKey: getQueryKey(id),
  queryFn,
  enabled: !!id,
  cacheTime: Infinity,
  staleTime: Infinity
})

export const useCountryQuery = id => useQuery(getQueryOptions(id))

export const useCountryQueries = ids =>
  useQueries(
    Array.from(new Set(ids))
      .filter(Boolean)
      .map(id => getQueryOptions(id))
  )
