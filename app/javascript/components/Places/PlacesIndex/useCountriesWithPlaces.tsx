import { CountryRecord, recordQueryKey } from 'api/countries'
import { useQueryClient } from '@tanstack/react-query'
import { Place } from 'api/places'

const useCountriesWithPlaces = (
  places: Place[],
  searchTerm: string,
  bounds: google.maps.LatLngBounds | null | undefined
) => {
  const queryClient = useQueryClient()
  const countries = Array.from(new Set(places.map(place => place.countryId)))
    .map(id => queryClient.getQueryData<CountryRecord>(recordQueryKey(id)))
    .filter(
      (country: CountryRecord | undefined): country is CountryRecord =>
        country !== undefined
    )

  const term = searchTerm.toLowerCase()
  const filteredPlaces =
    term || bounds
      ? places.filter(place => {
          const matchesSearchTerm = place.name.toLowerCase().includes(term)
          const matchesBoundary = bounds
            ? bounds.contains({ lat: place.latitude, lng: place.longitude })
            : true

          return matchesSearchTerm && matchesBoundary
        })
      : places

  return countries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(country => ({
      ...country,
      places: filteredPlaces.filter(place => place.countryId === country.id)
    }))
    .filter(country => country.places.length > 0)
}

export default useCountriesWithPlaces
