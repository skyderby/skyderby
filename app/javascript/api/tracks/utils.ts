import { TrackRelations } from 'api/tracks/types'
import { QueryClient } from 'react-query'
import { cachePlaces } from 'api/places'
import { cacheSuits } from 'api/suits'
import { cacheProfiles } from 'api/profiles'
import { cacheCountries } from 'api/countries'
import { cacheManufacturers } from 'api/manufacturer'

export const cacheRelations = (
  relations: TrackRelations,
  queryClient: QueryClient
): void => {
  cachePlaces(relations.places, queryClient)
  cacheSuits(relations.suits, queryClient)
  cacheProfiles(relations.profiles, queryClient)
  cacheCountries(relations.countries, queryClient)
  cacheManufacturers(relations.manufacturers, queryClient)
}
