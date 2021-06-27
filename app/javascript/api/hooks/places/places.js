import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadCountries } from 'api/hooks/countries'
import { getQueryKey as getPlaceQueryKey } from './place'

const endpoint = '/api/v1/places'

const buildUrl = (params = {}) => {
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, value)
  })

  return `${endpoint}?${urlParams.toString()}`
}

const getAllPlaces = async () => {
  const perPage = 100
  const { data: firstChunk } = await axios.get(buildUrl({ perPage }))

  const restPages = new Array(firstChunk.totalPages - 1).fill().map((_el, idx) => idx + 2)

  const restChunks = await Promise.all(
    restPages.map(async page => {
      const { data } = await axios.get(buildUrl({ page, perPage }))
      return data
    })
  )

  const allChunks = [firstChunk, ...restChunks]

  return allChunks.map(chunk => chunk.items).flat()
}

const getPlaces = params => axios.get(buildUrl(params))

const getQueryKey = params => ['places', params].filter(Boolean)

const cachePlaces = (places, queryClient) =>
  places
    .filter(place => !queryClient.getQueryData(getPlaceQueryKey(place.id)))
    .forEach(place => queryClient.setQueryData(getQueryKey(place.id), place))

const buildAllPlacesQueryFn = queryClient => async () => {
  const places = await getAllPlaces()

  const countryIds = places.map(place => place.countryId)
  await preloadCountries(countryIds, queryClient)

  cachePlaces(places, queryClient)

  return places
}

const buildPlacesQueryFn = queryClient => async ctx => {
  const [_key, params] = ctx.queryKey
  const { data } = await getPlaces(params)

  const places = data?.items ?? []

  const countryIds = places.map(place => place.countryId)
  await preloadCountries(countryIds, queryClient)

  cachePlaces(places, queryClient)

  return data
}

const cacheOptions = {
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
}

export const placesQuery = (params, queryClient) => ({
  queryKey: getQueryKey(params),
  queryFn: buildPlacesQueryFn(queryClient),
  ...cacheOptions
})

export const useAllPlacesQuery = () => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: getQueryKey(),
    queryFn: buildAllPlacesQueryFn(queryClient),
    ...cacheOptions
  })
}
