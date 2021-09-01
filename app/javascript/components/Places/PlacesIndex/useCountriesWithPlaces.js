import { recordQueryKey } from 'api/hooks/countries'
import { useQueryClient } from 'react-query'

const useCountriesWithPlaces = (places, searchTerm, bounds) => {
  const queryClient = useQueryClient()
  const countries = Array.from(new Set(places.map(place => place.countryId))).map(id =>
    queryClient.getQueryData(recordQueryKey(id))
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
