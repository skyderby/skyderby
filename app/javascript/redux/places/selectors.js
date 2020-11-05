import { selectCountry } from 'redux/countries'

export const selectPlace = (state, placeId) => {
  const { byId: placesById } = state.places
  const place = placesById[placeId]

  if (!place) return null

  const country = selectCountry(state, place.countryId)

  return { ...place, country }
}

export const selectPlaces = state => {
  const { allIds, byId } = state.places

  return allIds.map(id => byId[id])
}

export const createPlaceSelector = placeId => state => selectPlace(state, placeId)
