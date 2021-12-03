import { QueryClient } from 'react-query'

import { loadIds } from 'api/helpers'
import { preloadCountries } from 'api/countries'
import type { PlaceRecord, PlacesIndex } from './types'
import { endpoint, recordQueryKey, cachePlaces } from './utils'

const getPlacesById = (ids: number[]): Promise<Omit<PlacesIndex, 'relations'>> =>
  loadIds<PlaceRecord>(endpoint, ids)

const preloadPlaces = async (
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

export default preloadPlaces
