import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryResult
} from 'react-query'

import { PlaceRecord, PlacesIndex } from 'api/places/types'
import {
  AllPlacesQueryKey,
  allPlacesQueryKey,
  cacheOptions,
  cachePlaces,
  buildUrl
} from './utils'
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
