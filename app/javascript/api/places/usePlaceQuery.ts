import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  useSuspenseQuery
} from '@tanstack/react-query'
import client, { AxiosError, AxiosResponse } from 'api/client'
import queryClient from 'components/queryClient'
import {
  cacheOptions,
  elementEndpoint,
  recordQueryKey,
  placeSchema,
  Place,
  RecordQueryKey
} from './common'
import { preloadCountries } from 'api/countries'

const getPlace = (id: number): Promise<Place> =>
  client
    .get<never, AxiosResponse<Place>>(elementEndpoint(id))
    .then(response => placeSchema.parse(response.data))

const queryFn: QueryFunction<Place, RecordQueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey

  if (typeof id !== 'number') {
    throw new Error(`Expected place id to be a number, received ${typeof id}`)
  }

  const place = await getPlace(id)

  await preloadCountries([place.countryId], queryClient)

  return place
}

type QueryOptions = UseQueryOptions<Place, AxiosError, Place, RecordQueryKey>

export const placeQuery = (id: number | null | undefined): QueryOptions => ({
  queryKey: recordQueryKey(id),
  queryFn,
  enabled: Boolean(id),
  ...cacheOptions
})

export const usePlaceQuery = (
  id: number | null | undefined,
  options: Omit<QueryOptions, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<Place, AxiosError> => {
  return useQuery({
    ...placeQuery(id),
    ...options
  })
}

export const usePlaceSuspenseQuery = (id: number) => {
  return useSuspenseQuery(placeQuery(id))
}
