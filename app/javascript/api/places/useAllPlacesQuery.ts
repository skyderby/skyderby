import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query'

import {
  AllPlacesQueryKey,
  allPlacesQueryKey,
  cacheOptions,
  cachePlaces,
  buildUrl,
  PlaceRecord,
  PlacesIndex
} from './common'
import { cacheCountries } from 'api/countries'
import { depaginate } from 'api/helpers'

const getAllPlaces = async (): Promise<PlacesIndex[]> =>
  depaginate<PlaceRecord, PlacesIndex['relations']>(buildUrl)

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

const useAllPlacesQuery = (): UseQueryResult<PlaceRecord[]> => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: allPlacesQueryKey,
    queryFn: buildAllPlacesQueryFn(queryClient),
    ...cacheOptions
  })
}

export default useAllPlacesQuery
