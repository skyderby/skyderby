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
  Place,
  RecordQueryKey
} from './common'
import { preloadCountries } from 'api/countries'

const getPlace = (id: number): Promise<Place> =>
  client
    .get<never, AxiosResponse<Place>>(elementEndpoint(id))
    .then(response => response.data)

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<Place, RecordQueryKey> => async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected place id to be a number, received ${typeof id}`)
  }

  const place = await getPlace(id)

  await preloadCountries([place.countryId], queryClient)

  return place
}

type QueryOptions = UseQueryOptions<Place, AxiosError, Place, RecordQueryKey>

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
): UseQueryResult<Place, AxiosError> => {
  const queryClient = useQueryClient()

  return useQuery({
    ...placeQuery(id, queryClient),
    ...options
  })
}

export default usePlaceQuery
