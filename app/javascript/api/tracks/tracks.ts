import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  QueryClient,
  QueryFunction,
  UseQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult
} from 'react-query'
import { isMobileOnly } from 'react-device-detect'
import client from 'api/client'

import { cacheRelations } from './utils'
import {
  TracksIndex,
  IndexParams,
  IndexQueryKey,
  InfiniteIndexQueryKey,
  allowedFilters,
  FilterKey,
  isAllowedActivity,
  isAllowedSort,
  FilterTuple
} from './types'

const endpoint = '/api/v1/tracks'

const prefixKey = (key: string, prefix: string | undefined) =>
  prefix ? `${prefix}[${key}]` : key

export const mapParamsToUrl = (
  { activity, filters = [], search, page, sortBy }: IndexParams,
  prefix?: string
): string => {
  const params = new URLSearchParams()

  if (activity) params.set(prefixKey('kind', prefix), activity)
  if (sortBy) params.set(prefixKey('sortBy', prefix), sortBy)
  if (Number(page) > 1) params.set(prefixKey('page', prefix), String(page))
  if (search) params.set(prefixKey('search', prefix), search)

  const filterEntries = Array.isArray(filters) ? filters : Object.entries(filters)
  filterEntries.forEach(([key, val]) =>
    params.append(`${prefixKey(key, prefix)}[]`, String(val))
  )

  return params.toString() === '' ? '' : '?' + params.toString()
}

export const extractParamsFromUrl = (
  urlSearch: string,
  prefix = ''
): Omit<IndexParams, 'filters'> & { filters: FilterTuple[] } => {
  const allParams = new URLSearchParams(urlSearch)

  const activityParam = allParams.get(prefixKey('kind', prefix))
  const sortByParam = allParams.get(prefixKey('sortBy', prefix))
  const activity = isAllowedActivity(activityParam) ? activityParam : undefined
  const sortBy = isAllowedSort(sortByParam) ? sortByParam : undefined
  const page = Number(allParams.get(prefixKey('page', prefix))) || 1

  const filters = Array.from(allParams.entries())
    .map(([key, val]): FilterTuple | undefined => {
      const filterKey = allowedFilters.find((filter): filter is FilterKey => {
        const singularKey = prefixKey(filter, prefix)
        const pluralKey = `${singularKey}[]`

        return [singularKey, pluralKey].includes(key)
      })

      if (!filterKey) return

      return [filterKey, val]
    })
    .filter((el: FilterTuple | undefined): el is FilterTuple => el !== undefined)

  const perPage = isMobileOnly ? 5 : 20

  return { activity, filters, page, perPage, sortBy }
}

const getTracks = (params: IndexParams): Promise<TracksIndex> =>
  client.get([endpoint, mapParamsToUrl(params)].join('')).then(response => response.data)

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<TracksIndex, IndexQueryKey | InfiniteIndexQueryKey> => async ctx => {
  const [_key, params] = ctx.queryKey
  const data = await getTracks({ ...params, page: ctx.pageParam ?? params.page ?? 1 })

  cacheRelations(data.relations, queryClient)

  return data
}

export const tracksQuery = (
  params: IndexParams = {},
  queryClient: QueryClient,
  options = {}
): UseQueryOptions<TracksIndex, Error, TracksIndex, IndexQueryKey> => ({
  queryKey: ['tracks', params],
  queryFn: buildQueryFn(queryClient),
  ...options
})

export const useTracksQuery = (
  params: IndexParams
): UseQueryResult<TracksIndex, Error> => {
  const queryClient = useQueryClient()

  return useQuery(tracksQuery(params, queryClient, { keepPreviousData: true }))
}

export const useTracksInfiniteQuery = ({
  page,
  ...params
}: IndexParams): UseInfiniteQueryResult<TracksIndex> => {
  const queryClient = useQueryClient()

  return useInfiniteQuery({
    queryKey: ['infiniteTracks', params],
    queryFn: buildQueryFn(queryClient),
    getNextPageParam: lastPage => {
      if (lastPage.currentPage >= lastPage.totalPages) return undefined
      return lastPage.currentPage + 1
    },
    staleTime: 30 * 1000
  })
}
