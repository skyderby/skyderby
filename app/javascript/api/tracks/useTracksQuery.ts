import { QueryFunction, UseQueryOptions, useSuspenseQuery } from '@tanstack/react-query'
import client from 'api/client'
import {
  IndexParams,
  IndexQueryKey,
  InfiniteIndexQueryKey,
  TrackIndex,
  trackIndexResponseSchema,
  collectionEndpoint,
  cacheRelations
} from './common'
import { mapParamsToUrl } from './urlParams'

const getTracks = (params: IndexParams) =>
  client
    .get<never>([collectionEndpoint, mapParamsToUrl(params)].join(''))
    .then(response => trackIndexResponseSchema.parse(response.data))

export const queryFn: QueryFunction<
  Omit<TrackIndex, 'relations'>,
  IndexQueryKey | InfiniteIndexQueryKey,
  number | never
> = async ctx => {
  const [_key, params] = ctx.queryKey
  const { relations, ...data } = await getTracks({
    ...params,
    page: ctx.pageParam ?? params.page ?? 1
  })

  cacheRelations(relations)

  return data
}

export const tracksQuery = (
  params: IndexParams = {},
  options = {}
): UseQueryOptions<TrackIndex, Error, TrackIndex, IndexQueryKey> => ({
  queryKey: ['tracks', params],
  queryFn,
  ...options
})

const useTracksQuery = (params: IndexParams) =>
  useSuspenseQuery<TrackIndex, Error, TrackIndex, IndexQueryKey>(tracksQuery(params))

export default useTracksQuery
