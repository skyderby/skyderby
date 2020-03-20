import { selectCountry } from 'redux/countries'
import { selectPlace } from 'redux/places'

const withAssociations = (terrainProfile, state) => {
  const place = selectPlace(state, terrainProfile.placeId)
  const country = selectCountry(state, place.countryId)

  return {
    ...terrainProfile,
    place,
    country
  }
}

export const terrainProfilesSelector = state => {
  const { allIds, byId } = state.terrainProfiles

  const terrainProfiles = allIds.map(id => {
    const item = byId[id]
    return withAssociations(item, state)
  })

  return terrainProfiles
}

export const createTerrainProfileSelector = terrainProfileId => state => {
  const { allIds, byId } = state.terrainProfiles

  if (!allIds.includes(terrainProfileId)) return null

  const terrainProfile = byId[terrainProfileId]

  return withAssociations(terrainProfile, state)
}
