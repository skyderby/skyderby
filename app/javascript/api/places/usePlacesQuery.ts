import { QueryClient, QueryFunction, useQueryClient, UseQueryOptions } from 'react-query'
import { IndexParams, PlaceRecord, PlacesIndex } from 'api/places/types'
import {
  buildUrl,
  cacheOptions,
  indexQueryKey,
  IndexQueryKey,
  recordQueryKey
} from './utils'
import { cacheCountries } from 'api/countries'
import { cachePlaces } from './utils'
import axios, { AxiosResponse } from 'axios'

export const getPlaces = (params: IndexParams): Promise<PlacesIndex> =>
  axios
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

export const usePlaces = (ids: number[]): PlaceRecord[] => {
  const queryClient = useQueryClient()
  return ids
    .map(id =>
      id ? queryClient.getQueryData<PlaceRecord>(recordQueryKey(id)) : undefined
    )
    .filter((record): record is PlaceRecord => record !== undefined)
}
