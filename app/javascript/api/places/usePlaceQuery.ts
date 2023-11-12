import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'

import {
  cacheOptions,
  elementEndpoint,
  recordQueryKey,
  PlaceRecord,
  RecordQueryKey
} from './common'
import { preloadCountries } from 'api/countries'

const getPlace = (id: number): Promise<PlaceRecord> =>
  client
    .get<never, AxiosResponse<PlaceRecord>>(elementEndpoint(id))
    .then(response => response.data)

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<PlaceRecord, RecordQueryKey> => async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected place id to be a number, received ${typeof id}`)
  }

  const place = await getPlace(id)

  await preloadCountries([place.countryId], queryClient)

  return place
}

type QueryOptions = UseQueryOptions<PlaceRecord, AxiosError, PlaceRecord, RecordQueryKey>

export const placeQuery = (
  id: number | null | undefined,
  queryClient: QueryClient
): QueryOptions => ({
  queryKey: recordQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: Boolean(id),
  ...cacheOptions
})

const usePlaceQuery = (
  id: number | null | undefined,
  options: Omit<QueryOptions, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<PlaceRecord, AxiosError> => {
  const queryClient = useQueryClient()

  return useQuery({
    ...placeQuery(id, queryClient),
    ...options
  })
}

export default usePlaceQuery
