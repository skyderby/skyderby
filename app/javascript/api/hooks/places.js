import { useQueries, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import {
  getQueryOptions as getCountryQueryOptions,
  preloadCountries
} from 'api/hooks/countries'
import { loadIds } from 'api/helpers'

const endpoint = '/api/v1/places'

const getPlace = id => axios.get(`${endpoint}/${id}`)

const getPlacesById = ids => loadIds(endpoint, ids)

const getQueryKey = id => ['places', id]

const buildQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getPlace(id)

  await queryClient.prefetchQuery(getCountryQueryOptions(data.countryId))

  return data
}

export const preloadPlaces = async (ids, queryClient) => {
  const missingIds = ids.filter(id => id && !queryClient.getQueryData(getQueryKey(id)))

  if (missingIds.length === 0) return

  const { items: places } = await getPlacesById(missingIds)
  places.forEach(place => queryClient.setQueryData(getQueryKey(place.id), place))

  await preloadCountries(
    places.map(place => place.countryId),
    queryClient
  )

  return places
}

export const getQueryOptions = (id, queryClient) => ({
  queryKey: getQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: !!id,
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
})

export const usePlaceQuery = id => {
  const queryClient = useQueryClient()
  return useQuery(getQueryOptions(id, queryClient))
}

export const usePlaceQueries = ids => {
  const queryClient = useQueryClient()
  return useQueries(ids.filter(Boolean).map(id => getQueryOptions(id, queryClient)))
}
