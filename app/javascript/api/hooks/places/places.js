import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadCountries } from 'api/hooks/countries'

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

const getQueryKey = () => ['places']

const buildQueryFn = queryClient => async () => {
  const places = await getAllPlaces()

  const countryIds = places.map(place => place.countryId)
  await preloadCountries(countryIds, queryClient)

  return places
}

export const getQueryOptions = queryClient => ({
  queryKey: getQueryKey(),
  queryFn: buildQueryFn(queryClient),
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
})

export const usePlacesQuery = () => {
  const queryClient = useQueryClient()

  return useQuery(getQueryOptions(queryClient))
}
