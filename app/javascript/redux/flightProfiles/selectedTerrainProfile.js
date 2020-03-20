import { SELECT_TERRAIN_PROFILE } from './actionTypes'
import { loadTerrainProfileMeasurement } from 'redux/terrainProfiles/measurements'

export const selectTerrainProfile = terrainProfileId => {
  return async dispatch => {
    dispatch({ type: SELECT_TERRAIN_PROFILE, payload: { terrainProfileId } })

    dispatch(loadTerrainProfileMeasurement(terrainProfileId))
  }
}

const initialState = null

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case SELECT_TERRAIN_PROFILE:
      return action.payload.terrainProfileId
    default:
      return state
  }
}
