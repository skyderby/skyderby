import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'

import { PlaceRecord } from 'api/places/types'
import { cacheOptions, endpoint, recordQueryKey, RecordQueryKey } from 'api/places/utils'
import { preloadCountries } from 'api/countries'

const getPlace = (id: number): Promise<PlaceRecord> =>
  axios
    .get<never, AxiosResponse<PlaceRecord>>(`${endpoint}/${id}`)
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

export const placeQuery = (
  id: number | null | undefined,
  queryClient: QueryClient
): UseQueryOptions<PlaceRecord, AxiosError, PlaceRecord, RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn: buildQueryFn(queryClient),
  enabled: Boolean(id),
  ...cacheOptions
})

const usePlaceQuery = (
  id: number | null | undefined,
  options: UseQueryOptions<PlaceRecord, AxiosError, PlaceRecord, RecordQueryKey> = {}
): UseQueryResult<PlaceRecord, AxiosError> => {
  const queryClient = useQueryClient()

  return useQuery({
    ...placeQuery(id, queryClient),
    ...options
  })
}

export default usePlaceQuery
