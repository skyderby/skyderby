import { useMutation, useQueries, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadCountries } from 'api/hooks/countries'
import { loadIds } from 'api/helpers'
import { getCSRFToken } from 'utils/csrfToken'

const endpoint = '/api/v1/places'

const getPlace = id => axios.get(`${endpoint}/${id}`)
const getPlacesById = ids => loadIds(endpoint, ids)
const createPlace = place =>
  axios.post(endpoint, { place }, { headers: { 'X-CSRF-Token': getCSRFToken() } })

export const getQueryKey = id => ['places', id]

const buildQueryFn = queryClient => async ctx => {
  const [_key, id] = ctx.queryKey
  const { data } = await getPlace(id)

  await preloadCountries([data.countryId], queryClient)

  return data
}

export const cachePlaces = (places, queryClient) =>
  places.forEach(place => queryClient.setQueryData(getQueryKey(place.id), place))

export const preloadPlaces = async (ids, queryClient) => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => id && !queryClient.getQueryData(getQueryKey(id)))

  if (missingIds.length === 0) return

  const { items: places } = await getPlacesById(missingIds)
  cachePlaces(places, queryClient)

  await preloadCountries(
    places.map(place => place.countryId),
    queryClient
  )

  return places
}

export const placeQuery = (id, queryClient) => ({
  queryKey: getQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: !!id,
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
})

export const usePlaceQuery = (id, options = {}) => {
  const queryClient = useQueryClient()
  return useQuery({ ...placeQuery(id, queryClient), ...options })
}

export const usePlaceQueries = ids => {
  const queryClient = useQueryClient()
  return useQueries(ids.filter(Boolean).map(id => placeQuery(id, queryClient)))
}

const queryKey = id => ['place', id]

export const useNewPlaceMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createPlace, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), response.data)
    }
  })
}
