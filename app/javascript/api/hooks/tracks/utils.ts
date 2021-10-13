import { TrackRelations } from 'api/hooks/tracks/types'
import { QueryClient } from 'react-query'
import { cachePlaces } from 'api/hooks/places'
import { cacheSuits } from 'api/hooks/suits'
import { cacheProfiles } from 'api/hooks/profiles'
import { cacheCountries } from 'api/hooks/countries'
import { cacheManufacturers } from 'api/hooks/manufacturer'

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
