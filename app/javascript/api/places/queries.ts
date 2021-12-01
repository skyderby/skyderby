import {
  QueryClient,
  QueryFunction,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'

import { cacheCountries, preloadCountries } from 'api/countries'

import {
  PlaceRecord,
  PlacesIndex,
  IndexParams,
  RecordQueryKey,
  IndexQueryKey,
  AllPlacesQueryKey
} from './types'
import { getAllPlaces, getPlaces, getPlace, getPlacesById, createPlace } from './requests'

const allPlacesQueryKey: AllPlacesQueryKey = ['places', 'all']
const indexQueryKey = (params: IndexParams): IndexQueryKey => ['places', params]
const recordQueryKey = (id: number | null | undefined): RecordQueryKey => ['places', id]

const buildAllPlacesQueryFn = (
  queryClient: QueryClient
): QueryFunction<PlaceRecord[], AllPlacesQueryKey> => async () => {
  const chunks = await getAllPlaces()
  const places = chunks.map(chunk => chunk.items).flat()
  const countries = chunks.map(chunk => chunk.relations.countries).flat()

  cachePlaces(places, queryClient)
  cacheCountries(countries, queryClient)

  return places
}

const buildPlacesQueryFn = (
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

const buildPlaceQueryFn = (
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

export const cachePlaces = (places: PlaceRecord[], queryClient: QueryClient): void =>
  places
    .filter(place => !queryClient.getQueryData(recordQueryKey(place.id)))
    .forEach(place => queryClient.setQueryData(recordQueryKey(place.id), place))

export const preloadPlaces = async (
  ids: number[],
  queryClient: QueryClient
): Promise<PlaceRecord[]> => {
  const missingIds = ids
    .filter(Boolean)
    .filter(id => id && !queryClient.getQueryData(recordQueryKey(id)))

  if (missingIds.length === 0) return []

  const { items: places } = await getPlacesById(missingIds)
  cachePlaces(places, queryClient)

  await preloadCountries(
    places.map(place => place.countryId),
    queryClient
  )

  return places
}

const cacheOptions = {
  cacheTime: 60 * 30 * 1000,
  staleTime: 60 * 10 * 1000
}

export const placeQuery = (
  id: number | null | undefined,
  queryClient: QueryClient
): UseQueryOptions<PlaceRecord, AxiosError, PlaceRecord, RecordQueryKey> => ({
  queryKey: recordQueryKey(id),
  queryFn: buildPlaceQueryFn(queryClient),
  enabled: Boolean(id),
  ...cacheOptions
})

export const usePlaceQuery = (
  id: number | null | undefined,
  options: UseQueryOptions<PlaceRecord, AxiosError, PlaceRecord, RecordQueryKey> = {}
): UseQueryResult<PlaceRecord, AxiosError> => {
  const queryClient = useQueryClient()

  return useQuery({
    ...placeQuery(id, queryClient),
    ...options
  })
}

export const placesQuery = (
  params: IndexParams = {},
  queryClient: QueryClient
): UseQueryOptions<PlacesIndex, Error, PlacesIndex, IndexQueryKey> => ({
  queryKey: indexQueryKey(params),
  queryFn: buildPlacesQueryFn(queryClient),
  ...cacheOptions
})

export const useAllPlacesQuery = (): UseQueryResult<PlaceRecord[]> => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: allPlacesQueryKey,
    queryFn: buildAllPlacesQueryFn(queryClient),
    ...cacheOptions
  })
}

export const usePlaces = (ids: number[]): PlaceRecord[] => {
  const queryClient = useQueryClient()
  return ids
    .map(id =>
      id ? queryClient.getQueryData<PlaceRecord>(recordQueryKey(id)) : undefined
    )
    .filter((record): record is PlaceRecord => record !== undefined)
}

export const useNewPlaceMutation = (): UseMutationResult<
  AxiosResponse<PlaceRecord>,
  AxiosError,
  PlaceRecord
> => {
  const queryClient = useQueryClient()

  return useMutation(createPlace, {
    onSuccess(response) {
      queryClient.setQueryData(recordQueryKey(response.data.id), response.data)
    }
  })
}
