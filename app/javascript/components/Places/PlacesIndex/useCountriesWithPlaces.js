import { useCountryQueries } from 'api/hooks/countries'

const useCountriesWithPlaces = (places, searchTerm, bounds) => {
  const countryQueries = useCountryQueries(places.map(place => place.countryId))

  const term = searchTerm.toLowerCase()
  const filteredPlaces = places.filter(place => {
    const matchesSearchTerm = place.name.toLowerCase().includes(term)
    const matchesBoundary = bounds
      ? bounds.contains({ lat: place.latitude, lng: place.longitude })
      : true

    return matchesSearchTerm && matchesBoundary
  })

  const countries = countryQueries
    .map(query => query.data)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(country => ({
      ...country,
      places: filteredPlaces.filter(place => place.countryId === country.id)
    }))
    .filter(country => country.places.length > 0)

  return countries
}

export default useCountriesWithPlaces
