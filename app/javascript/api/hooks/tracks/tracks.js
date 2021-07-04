import { useQuery, useQueryClient, useInfiniteQuery } from 'react-query'
import { isMobileOnly } from 'react-device-detect'
import axios from 'axios'

import { preloadPlaces } from 'api/hooks/places'
import { preloadProfiles } from 'api/hooks/profiles'
import { preloadSuits } from 'api/hooks/suits'

const endpoint = '/api/v1/tracks'

const prefixKey = (key, prefix) => (prefix ? `${prefix}[${key}]` : key)
const allowedFilters = ['profileId', 'suitId', 'placeId', 'year']

export const mapParamsToUrl = ({ activity, filters, page, sortBy }, prefix) => {
  const params = new URLSearchParams()

  if (activity) params.set(prefixKey('kind', prefix), activity)
  if (sortBy) params.set(prefixKey('sortBy', prefix), sortBy)
  if (Number(page) > 1) params.set(prefixKey('page', prefix), page)

  const filterEntries = Array.isArray(filters) ? filters : Object.entries(filters)
  filterEntries.forEach(([key, val]) => params.append(`${prefixKey(key, prefix)}[]`, val))

  return params.toString() === '' ? '' : '?' + params.toString()
}

export const extractParamsFromUrl = (urlSearch, prefix) => {
  const allParams = new URLSearchParams(urlSearch)

  const activity = allParams.get(prefixKey('kind', prefix))
  const sortBy = allParams.get(prefixKey('sortBy', prefix))
  const page = allParams.get(prefixKey('page', prefix)) || 1

  const filters = Array.from(allParams.entries())
    .map(([key, val]) => {
      const filterKey = allowedFilters.find(filter => {
        const singularKey = prefixKey(filter, prefix)
        const pluralKey = `${singularKey}[]`

        return [singularKey, pluralKey].includes(key)
      })

      return [filterKey, val]
    })
    .filter(([key, _val]) => key)

  const perPage = isMobileOnly ? 5 : 25

  return { activity, filters, page, perPage, sortBy }
}

const getTracks = params => axios.get([endpoint, mapParamsToUrl(params)].join(''))

const buildQueryFn = queryClient => async ctx => {
  const [_key, params] = ctx.queryKey
  const { data } = await getTracks({ ...params, page: ctx.pageParam ?? params.page ?? 1 })

  await Promise.all([
    preloadPlaces(data.items.map(track => track.placeId).filter(Boolean), queryClient),
    preloadSuits(data.items.map(track => track.suitId).filter(Boolean), queryClient),
    preloadProfiles(data.items.map(track => track.profileId).filter(Boolean), queryClient)
  ])

  return data
}

export const tracksQuery = (params, queryClient, options = {}) => ({
  queryKey: ['tracks', params],
  queryFn: buildQueryFn(queryClient),
  ...options
})

export const useTracksQuery = params => {
  const queryClient = useQueryClient()

  return useQuery(tracksQuery(params, queryClient, { keepPreviousData: true }))
}

export const useTracksInfiniteQuery = ({ page, ...params }) => {
  const queryClient = useQueryClient()

  return useInfiniteQuery({
    queryKey: ['tracks', params],
    queryFn: buildQueryFn(queryClient),
    getNextPageParam: lastPage => {
      if (lastPage.currentPage >= lastPage.totalPages) return undefined
      return lastPage.currentPage + 1
    },
    staleTime: 30 * 1000
  })
}
