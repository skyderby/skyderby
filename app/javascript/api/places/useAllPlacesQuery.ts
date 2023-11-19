import { QueryFunction, useQuery, UseQueryResult } from '@tanstack/react-query'

import {
  AllPlacesQueryKey,
  allPlacesQueryKey,
  cacheOptions,
  cachePlaces,
  buildUrl,
  Place,
  PlacesIndex
} from './common'
import { cacheCountries } from 'api/countries'
import { depaginate } from 'api/helpers'

const getAllPlaces = async (): Promise<PlacesIndex[]> =>
  depaginate<Place, PlacesIndex['relations']>(buildUrl)

const allPlacesQueryFn: QueryFunction<Place[], AllPlacesQueryKey> = async () => {
  const chunks = await getAllPlaces()
  const places = chunks.map(chunk => chunk.items).flat()
  const countries = chunks.map(chunk => chunk.relations.countries).flat()

  cachePlaces(places)
  cacheCountries(countries)

  return places
}

const useAllPlacesQuery = (): UseQueryResult<Place[]> =>
  useQuery({
    queryKey: allPlacesQueryKey,
    queryFn: allPlacesQueryFn,
    ...cacheOptions
  })

export default useAllPlacesQuery
