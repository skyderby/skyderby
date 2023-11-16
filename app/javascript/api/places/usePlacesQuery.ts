import {
  QueryClient,
  QueryFunction,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import {
  IndexParams,
  Place,
  PlacesIndex,
  buildUrl,
  cacheOptions,
  indexQueryKey,
  IndexQueryKey,
  recordQueryKey,
  cachePlaces
} from './common'
import { cacheCountries } from 'api/countries'
import client, { AxiosResponse } from 'api/client'

export const getPlaces = (params: IndexParams): Promise<PlacesIndex> =>
  client
    .get<never, AxiosResponse<PlacesIndex>>(buildUrl(params))
    .then(response => response.data)

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<PlacesIndex, IndexQueryKey> => async ctx => {
  const [_key, params] = ctx.queryKey
  const data = await getPlaces(params)

  const places = data.items
  const countries = data.relations.countries

  cachePlaces(places, queryClient)
  cacheCountries(countries, queryClient)

  return data
}

export const placesQuery = (
  params: IndexParams = {},
  queryClient: QueryClient
): UseQueryOptions<PlacesIndex, Error, PlacesIndex, IndexQueryKey> => ({
  queryKey: indexQueryKey(params),
  queryFn: buildQueryFn(queryClient),
  ...cacheOptions
})

const usePlaces = (ids: number[]): Place[] => {
  const queryClient = useQueryClient()
  return ids
    .map(id => (id ? queryClient.getQueryData<Place>(recordQueryKey(id)) : undefined))
    .filter((record): record is Place => record !== undefined)
}

export default usePlaces
