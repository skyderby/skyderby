import { QueryFunction, useQuery, UseQueryOptions, UseQueryResult } from 'react-query'
import { AxiosResponse } from 'axios'
import client from 'api/client'
import {
  TracksIndex,
  TrackIndexRecord,
  IndexParams,
  IndexQueryKey,
  InfiniteIndexQueryKey,
  deserialize,
  collectionEndpoint,
  cacheRelations
} from './common'
import { mapParamsToUrl } from './urlParams'
import { Serialized } from 'api/helpers'

type IndexResponse = TracksIndex<Serialized<TrackIndexRecord>>
type IndexResult = Omit<TracksIndex<TrackIndexRecord>, 'relations'>

const getTracks = (params: IndexParams) =>
  client
    .get<never, AxiosResponse<IndexResponse>>(
      [collectionEndpoint, mapParamsToUrl(params)].join('')
    )
    .then(response => response.data)

export const queryFn: QueryFunction<
  IndexResult,
  IndexQueryKey | InfiniteIndexQueryKey
> = async ctx => {
  const [_key, params] = ctx.queryKey
  const { items, relations, ...pagination } = await getTracks({
    ...params,
    page: ctx.pageParam ?? params.page ?? 1
  })

  cacheRelations(relations)

  return { items: items.map(deserialize), ...pagination }
}

export const tracksQuery = (
  params: IndexParams = {},
  options = {}
): UseQueryOptions<IndexResult, Error, IndexResult, IndexQueryKey> => ({
  queryKey: ['tracks', params],
  queryFn,
  ...options
})

const useTracksQuery = (params: IndexParams): UseQueryResult<IndexResult, Error> =>
  useQuery(tracksQuery(params, { keepPreviousData: true }))

export default useTracksQuery
