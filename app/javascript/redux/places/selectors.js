export const selectPlace = (state, placeId) => {
  const { byId: placesById } = state.places
  const { byId: countriesById } = state.countries

  const place = placesById[placeId]

  if (!place) return null

  const country = countriesById[place.countryId]

  return { ...place, country }
}

export const selectPlaces = state => {
  const { allIds, byId } = state.places

  return allIds.map(id => byId[id])
}

export const createPlaceSelector = placeId => state => selectPlace(state, placeId)
